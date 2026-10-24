"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { META_PIXEL_ID, getTrackingParams, trackMetaEvent } from "./landingTracking";
import { OPENAI_ADS_PIXEL_ID } from "./openAiAdsTracking";

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const isCrmRoute = pathname?.startsWith("/crm") || pathname?.startsWith("/workspace");

  useEffect(() => {
    if (isCrmRoute) return;

    // 1. Capture and save UTM query parameters
    getTrackingParams();

    // 2. Track PageView and ViewContent for Meta Ads
    trackMetaEvent("PageView");
    if (pathname === "/get-quote") {
      trackMetaEvent("ViewContent", {
        content_name: "Meta Ads Free Quote Landing Page",
        content_category: "Lead Generation",
      });
    }
  }, [pathname, isCrmRoute]);

  if (isCrmRoute) return null;

  return (
    <>
      {/* Client-side Meta Pixel Initialization */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `
        }}
      />
      {OPENAI_ADS_PIXEL_ID && (
        <Script
          id="openai-ads-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,'script','https://bzrcdn.openai.com/sdk/oaiq.min.js');
              oaiq('init',{pixelId:'${OPENAI_ADS_PIXEL_ID}',debug:${process.env.NODE_ENV !== "production"}});
            `,
          }}
        />
      )}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
