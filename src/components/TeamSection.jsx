"use client";

import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function TeamSection() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/team.json?v=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        setTeam(data);
      } catch (e) {
        console.error("Failed to load team data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  if (loading || team.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 w-full font-[Matter]" id="about-us">
      <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-10 px-4">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-4">
          Our Team
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-0 px-3 leading-tight pb-1">
          Team Behind Wonders
        </h2>
      </div>

      {/* Mobile / Tablet Carousel View */}
      <div className="block sm:hidden w-full">
        <Swiper
          className="w-full pb-8 px-4"
          spaceBetween={16}
          slidesPerView={1.3}
          centeredSlides={true}
        >
          {team.map((member) => (
            <SwiperSlide key={member.name}>
              <div className="px-1">
                <div className="p-[2px] rounded-[26px] bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_15px_35px_-8px_rgba(220,38,38,0.2)] group">
                  <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer bg-neutral-50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500 z-10 pointer-events-none" />
                    <img
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter group-hover:brightness-95"
                      src={member.image}
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-white/60 p-4 rounded-2xl text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform transition-all duration-500 group-hover:bottom-5 group-hover:bg-white group-hover:border-red-200/50 z-20">
                      <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-1.5 block">
                        {member.role}
                      </span>
                      <h3 className="text-gray-950 font-extrabold text-base leading-tight flex items-center justify-between gap-2">
                        {member.name}
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden sm:grid max-w-7xl mx-auto grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 px-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="p-[2px] rounded-[26px] bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_15px_35px_-8px_rgba(220,38,38,0.2)] group"
          >
            <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer bg-neutral-50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500 z-10 pointer-events-none" />
              <img
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter group-hover:brightness-95"
                src={member.image}
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-white/60 p-4 rounded-2xl text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform transition-all duration-500 group-hover:bottom-5 group-hover:bg-white group-hover:border-red-200/50 z-20">
                <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-1.5 block">
                  {member.role}
                </span>
                <h3 className="text-gray-950 font-extrabold text-base sm:text-lg leading-tight flex items-center justify-between gap-2">
                  {member.name}
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
