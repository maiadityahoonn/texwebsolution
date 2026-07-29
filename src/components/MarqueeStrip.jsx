export default function MarqueeStrip() {
  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-6 sm:mt-8">
      {/* Strip Left */}
      <div className="w-full overflow-hidden relative group">
        <div className="flex w-max animate-marquee-left">
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
          </div>
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
          </div>
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-1.png" style={{ color: "transparent" }} />
          </div>
        </div>
      </div>

      {/* Strip Right */}
      <div className="w-full overflow-hidden relative isolate group">
        <div className="flex w-max animate-marquee-right">
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
          </div>
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
          </div>
          <div className="flex gap-4 pr-4 shrink-0">
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
            <img alt="strip" className="h-20 sm:h-24 w-auto object-contain shrink-0" src="/common/strip-2.png" style={{ color: "transparent" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
