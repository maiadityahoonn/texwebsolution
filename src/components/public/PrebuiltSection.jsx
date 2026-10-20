"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createStaticCms } from "@/lib/staticCms";
import { safeExternalUrl, safeInternalPath } from "@/lib/safeUrl";

export default function PrebuiltSection() {
  const cms = createStaticCms();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cmsProducts = cms.list("prebuilt.products", "products", []);
  const visibleProducts = cmsProducts.length ? cmsProducts : products;

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

  if ((loading && !cmsProducts.length) || visibleProducts.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10 w-full font-[Matter]" id="prebuilt">
      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-4 sm:px-6 lg:px-8">

        {/* Staggered detailed grid list */}
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-12 space-y-10 min-[360px]:space-y-14 sm:space-y-20 md:space-y-24">
          {visibleProducts.map((product, index) => {
            // Alternate image left and right layout based on order or index
            const isImageLeft = index % 2 === 0;

            return (
              <div 
                key={product.title}
                className="grid md:grid-cols-2 gap-5 min-[360px]:gap-6 sm:gap-8 md:gap-12 items-center px-0 md:px-6 text-left"
              >
                {/* Image Side */}
                <div 
                  className={`flex justify-center items-center rounded-2xl min-[360px]:rounded-3xl bg-[#F3F3F3] w-full max-w-md aspect-[4/3] overflow-hidden p-2.5 min-[360px]:p-3 md:p-4 shadow-inner mx-auto ${
                    isImageLeft ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <Image width={800} height={600} 
                    alt={product.imageAlt} 
                    className="rounded-xl min-[360px]:rounded-2xl w-[92%] h-auto object-contain hover:scale-[1.03] transition-all duration-150" 
                    src={product.image}
                    loading="lazy"
                  />
                </div>

                {/* Text / Details Side */}
                <div 
                  className={`rounded-xl p-1.5 min-[360px]:p-3 sm:p-4 text-left ${
                    isImageLeft ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <h3 
                    className="text-xl min-[360px]:text-2xl md:text-3xl text-gray-900 mb-3.5 sm:mb-6 text-left font-medium leading-snug" 
                    style={{ fontFamily: "Matter" }}
                  >
                    {product.title}
                  </h3>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 font-poppins text-left">
                    {product.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-xs min-[360px]:text-sm text-left">
                        <span className="shrink-0 w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs min-[360px]:text-sm font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="flex-1 mt-0.5 min-[360px]:mt-1 leading-relaxed text-left">{bullet}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-start text-left">
                    {product.buttonLink.startsWith("http") ? (
                      <a href={safeExternalUrl(product.buttonLink)} target="_blank" rel="noopener noreferrer" className="max-w-full min-w-0">
                        <button 
                          className="px-5 min-[360px]:px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10 max-w-full truncate text-xs min-[360px]:text-sm font-medium" 
                          style={{ fontFamily: "Matter" }}
                        >
                          <span className="truncate">{product.buttonText}</span>
                        </button>
                      </a>
                    ) : (
                      <Link href={safeInternalPath(product.buttonLink, "/contact")} className="max-w-full min-w-0">
                        <button 
                          className="px-5 min-[360px]:px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:scale-[1.05] hover:bg-red-700 active:scale-[0.96] transition-all duration-100 shadow-red-600/10 max-w-full truncate text-xs min-[360px]:text-sm font-medium" 
                          style={{ fontFamily: "Matter" }}
                        >
                          <span className="truncate">{product.buttonText}</span>
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
