"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PrebuiltSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/prebuilt_and_custom.json?v=6");
        const data = await res.json();
        // The first 8 items in the JSON are the prebuilt solutions
        setProducts(data.slice(0, 8));
      } catch (e) {
        console.error("Failed to load prebuilt products:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 w-full font-[Matter]" id="prebuilt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Staggered detailed grid list */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-24">
          {products.map((product, index) => {
            // Alternate image left and right layout based on order or index
            const isImageLeft = index % 2 === 0;

            return (
              <div 
                key={product.title}
                className="grid md:grid-cols-2 gap-12 items-center px-2 md:px-6"
              >
                {/* Image Side */}
                <div 
                  className={`flex justify-center items-center rounded-3xl bg-[#F3F3F3] w-full max-w-md aspect-4/3 overflow-hidden p-3 md:p-4 shadow-inner ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <img 
                    alt={product.imageAlt} 
                    className="rounded-2xl w-[90%] h-auto object-contain hover:scale-[1.03] transition-all duration-150" 
                    src={product.image}
                    loading="lazy"
                  />
                </div>

                {/* Text / Details Side */}
                <div 
                  className={`rounded-xl p-4 text-left ${
                    isImageLeft ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h3 
                    className="text-2xl md:text-3xl text-gray-900 mb-6 text-center md:text-left font-medium" 
                    style={{ fontFamily: "Matter" }}
                  >
                    {product.title}
                  </h3>
                  
                  <ul className="space-y-4 mb-6 font-poppins">
                    {product.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm md:text-sm">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-1">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-center md:justify-start">
                    {product.buttonLink.startsWith("http") ? (
                      <a href={product.buttonLink} target="_blank" rel="noopener noreferrer">
                        <button 
                          className="px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10" 
                          style={{ fontFamily: "Matter" }}
                        >
                          {product.buttonText}
                        </button>
                      </a>
                    ) : (
                      <Link href={product.buttonLink}>
                        <button 
                          className="px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10" 
                          style={{ fontFamily: "Matter" }}
                        >
                          {product.buttonText}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
