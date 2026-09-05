"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function TeamSection({ limit, showSeeMore = false }) {
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

  const displayedTeam = limit ? team.slice(0, limit) : team;

  return (
    <section className="py-10 sm:py-12 w-full font-[Matter]" id="about-us">
      <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-10 px-4">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-full site-label font-semibold text-xs sm:text-sm font-[Matter] mb-3">
          Our Team
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-center bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent mb-3 px-3 leading-tight pb-1">
          Team Behind Wonders
        </h2>
        <p className="text-sm sm:text-base text-gray-500 font-poppins font-light max-w-xl mx-auto leading-relaxed">
          Meet the engineers, creative designers, and growth strategists driving TexWeb Solution.
        </p>
      </div>

      {/* Mobile / Tablet Carousel View */}
      <div className="block sm:hidden w-full">
        <Swiper
          className="w-full pb-16 px-4"
          spaceBetween={18}
          slidesPerView={1.25}
          centeredSlides={true}
        >
          {displayedTeam.map((member) => (
            <SwiperSlide key={member.name}>
              <div className="px-1 pb-4">
                <div className="relative p-[2px] rounded-[26px] bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_15px_35px_-8px_rgba(220,38,38,0.2)] group">
                  {/* Photo Container */}
                  <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer bg-neutral-50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity duration-500 z-10 pointer-events-none" />
                    <img
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter group-hover:brightness-95"
                      src={member.image}
                      loading="lazy"
                    />
                  </div>

                  {/* Floating Info Box with matching Gradient Border (Hover & Without Hover) */}
                  <div className="absolute bottom-0 translate-y-1/2 left-3 right-3 p-[2px] rounded-2xl bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 group-hover:from-red-600 group-hover:via-red-400 group-hover:to-red-600 transition-all duration-500 shadow-[0_10px_25px_rgba(0,0,0,0.08)] group-hover:shadow-[0_16px_36px_rgba(220,38,38,0.22)] z-30">
                    <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-3.5 text-left">
                      <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase mb-0.5 block">
                        {member.role}
                      </span>
                      <h3 className="text-gray-950 font-extrabold text-base leading-tight flex items-center justify-between gap-2 mb-1">
                        {member.name}
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shrink-0"></span>
                      </h3>
                      {member.desc && (
                        <p className="text-[11px] text-gray-500 leading-tight font-light font-poppins line-clamp-2">
                          {member.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden sm:grid max-w-7xl mx-auto grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-20 px-6 pt-2 pb-12">
        {displayedTeam.map((member) => (
          <div
            key={member.name}
            className="relative p-[2px] rounded-[26px] bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 hover:from-red-600 hover:via-red-400 hover:to-red-600 transition-all duration-500 shadow-sm hover:shadow-[0_15px_35px_-8px_rgba(220,38,38,0.25)] group"
          >
            {/* Photo Container */}
            <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer bg-neutral-50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity duration-500 z-10 pointer-events-none" />
              <img
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter group-hover:brightness-95"
                src={member.image}
                loading="lazy"
              />
            </div>

            {/* Floating Info Box with matching Gradient Border (Hover & Without Hover) */}
            <div className="absolute bottom-0 translate-y-1/2 left-3 right-3 sm:left-3.5 sm:right-3.5 p-[2px] rounded-2xl bg-gradient-to-b from-red-500/50 via-red-200/40 to-gray-200/60 group-hover:from-red-600 group-hover:via-red-400 group-hover:to-red-600 transition-all duration-500 shadow-[0_10px_25px_rgba(0,0,0,0.08)] group-hover:shadow-[0_16px_36px_rgba(220,38,38,0.22)] z-30">
              <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-3.5 sm:p-4 text-left">
                <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase mb-0.5 block">
                  {member.role}
                </span>
                <h3 className="text-gray-950 font-extrabold text-base sm:text-lg leading-tight flex items-center justify-between gap-2 mb-1">
                  {member.name}
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shrink-0"></span>
                </h3>
                {member.desc && (
                  <p className="text-[11px] text-gray-500 leading-snug font-light font-poppins line-clamp-2">
                    {member.desc}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See More / View All CTA Button */}
      {showSeeMore && (
        <div className="mt-6 sm:mt-8 flex justify-center px-4">
          <Link
            href="/about-us#about-us"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium text-sm transition-all duration-300 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 hover:scale-[1.03] active:scale-[0.98] group"
          >
            <span>See More Members</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      )}
    </section>
  );
}
