"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, MoreHorizontal, X } from "lucide-react";

export default function CrmMobileNav({
  activeSection,
  chatMobilePane,
  isDark,
  mobileMoreOpen,
  setMobileMoreOpen,
  mobilePrimaryNavItems = [],
  mobileMoreNavItems = [],
  handleMobileNavItem,
}) {
  const pathname = usePathname() || "";
  const isChatOpen = (activeSection === "chat" || pathname.startsWith("/crm/chat")) && chatMobilePane === "chat";

  const checkIsActive = (item) => {
    if (item.href) {
      if (item.href === "/crm/dashboard") {
        return pathname === "/crm/dashboard" || activeSection === "overview";
      }
      return pathname === item.href || pathname.startsWith(item.href + "/");
    }
    return item.section && activeSection === item.section;
  };

  return (
    <>
      {/* Bottom Sheet Drawer for "More" Navigation items */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
            onClick={() => setMobileMoreOpen(false)}
            aria-label="Close more menu"
          />

          {/* Bottom Sheet Slider */}
          <div
            className={`relative w-full max-h-[82dvh] rounded-t-[28px] border-t shadow-2xl flex flex-col z-10 overflow-hidden ${
              isDark
                ? "bg-[#111113] border-neutral-800 text-neutral-100"
                : "bg-white border-gray-200 text-gray-900 shadow-black/20"
            }`}
            style={{
              animation: "slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
            }}
          >
            {/* Pull handle bar */}
            <div
              className="pt-3 pb-1.5 flex justify-center shrink-0 cursor-pointer"
              onClick={() => setMobileMoreOpen(false)}
            >
              <div className="w-11 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Section Header */}
            <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800/80 shrink-0">
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-gray-400 dark:text-neutral-500 font-sans">
                MORE OPTIONS
              </span>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List with Icon, Label, Badge and Chevron */}
            <div className="overflow-y-auto flex-1 overscroll-contain py-1 divide-y divide-gray-100/60 dark:divide-neutral-800/40">
              {mobileMoreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = checkIsActive(item);

                const content = (
                  <>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 stroke-[1.8] ${
                          isActive
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-neutral-400"
                        }`}
                      />
                      <span className="text-sm font-semibold truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-400 dark:text-neutral-500"
                        }`}
                      />
                    </div>
                  </>
                );

                const itemClass = `w-full flex items-center justify-between px-5 py-3.5 transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-red-50/70 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold"
                    : "text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-900/60 active:bg-gray-100 dark:active:bg-neutral-800"
                }`;

                if (item.href) {
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileMoreOpen(false)}
                      className={itemClass}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      handleMobileNavItem?.(item);
                      setMobileMoreOpen(false);
                    }}
                    className={itemClass}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Primary Fixed Bottom Navigation */}
      <nav
        className={`${isChatOpen ? "!hidden" : "block"} fixed left-0 right-0 bottom-0 z-40 md:hidden border-t px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] transition-colors duration-200 ${
          isDark
            ? "bg-[#0b0b0c]/95 backdrop-blur-md border-neutral-800 text-neutral-400"
            : "bg-white/95 backdrop-blur-md border-gray-200/90 text-gray-600 shadow-lg shadow-black/5"
        }`}
      >
        <div className="grid grid-cols-5 items-center">
          {mobilePrimaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item);

            const content = (
              <>
                <div
                  className={`relative px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? isDark
                        ? "bg-red-500/15 text-red-400 scale-105"
                        : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                      : isDark
                      ? "text-neutral-400 group-hover:text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "stroke-[2.2]" : "stroke-[1.75]"
                    }`}
                  />
                  {item.badge > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ${
                        isDark ? "ring-[#0b0b0c]" : "ring-white"
                      }`}
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`w-full px-0.5 text-[10px] truncate text-center transition-colors ${
                    isActive
                      ? isDark
                        ? "font-extrabold text-red-400"
                        : "font-extrabold text-red-600"
                      : isDark
                      ? "font-medium text-neutral-400 group-hover:text-white"
                      : "font-medium text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </>
            );

            const btnClass = "relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group";

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={btnClass}
                  aria-label={item.label}
                  title={item.label}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMobileNavItem?.(item)}
                className={btnClass}
                aria-label={item.label}
                title={item.label}
              >
                {content}
              </button>
            );
          })}

          {/* "More" Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileMoreOpen((open) => !open)}
            className="relative min-w-0 h-13 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer group"
            aria-label="More"
            title="More"
          >
            <div
              className={`relative px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                mobileMoreOpen ||
                mobileMoreNavItems.some((item) => checkIsActive(item))
                  ? isDark
                    ? "bg-red-500/15 text-red-400 scale-105"
                    : "bg-red-50 text-red-600 scale-105 shadow-2xs"
                  : isDark
                  ? "text-neutral-400 group-hover:text-white"
                  : "text-gray-500 group-hover:text-gray-900"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 stroke-[2]" />
            </div>
            <span
              className={`w-full px-0.5 text-[10px] truncate text-center transition-colors ${
                mobileMoreOpen ||
                mobileMoreNavItems.some((item) => checkIsActive(item))
                  ? isDark
                    ? "font-extrabold text-red-400"
                    : "font-extrabold text-red-600"
                  : isDark
                  ? "font-medium text-neutral-400 group-hover:text-white"
                  : "font-medium text-gray-500 group-hover:text-gray-900"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
