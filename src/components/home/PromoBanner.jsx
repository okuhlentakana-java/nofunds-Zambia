import { useEffect, useRef } from "react";
import { useTangazoAd } from "../../hooks/useTangazoAd";

const ZONE = "primary_banner";

// Module-scoped so an impression only fires once per session even if this
// component unmounts/remounts (e.g. route change away and back).
const impressionSeen = new Set();

export default function PromoBanner() {
  const { isEmpty } = useTangazoAd(ZONE);
  const bannerRef = useRef(null);

  // ad_impression — IntersectionObserver, ≥50% visible for ≥1s, once per
  // session per zone (pattern C from tab 8).
  // NOTE: this is the same "primary_banner" zone also used on the Hot
  // Offers hero — that's expected (same zone reused across pages, not a
  // bug), they just never render at the same time so no double counting.
  // Live (non-fallback) creative metadata is unavailable at this layer —
  // see note in UniversalBanner.jsx.
  useEffect(() => {
    const el = bannerRef.current;
    const seenKey = `${ZONE}:${isEmpty ? "fallback" : "live"}`;
    if (!el || impressionSeen.has(seenKey)) return;

    let timer = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (timer) return;
            timer = setTimeout(() => {
              if (impressionSeen.has(seenKey)) return;
              impressionSeen.add(seenKey);
              const payload = {
                event: "ad_impression",
                ad_slot: ZONE,
                position: 1,
              };
              if (isEmpty) {
                payload.ad_id = `${ZONE}_fallback_promo`;
                payload.advertiser = "MTN";
              }
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push(payload);
              io.disconnect();
            }, 1000);
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        });
      },
      { threshold: [0.5] }
    );
    io.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      io.disconnect();
    };
  }, [isEmpty]);

  return (
    <div className="w-full mt-4 px-4">
      <div ref={bannerRef} className="rounded-2xl overflow-hidden max-w-screen-sm mx-auto">
        {isEmpty ? (
          <img
            src="/mtn-fibre-mpu-1080x500 2.jpg"
            alt="MTN Promo"
            className="w-full h-auto block"
          />
        ) : (
          <div
            data-tangazo-zone="primary_banner"
          />
        )}
      </div>
    </div>
  );
}