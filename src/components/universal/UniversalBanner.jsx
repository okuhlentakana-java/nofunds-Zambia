import { useState, useEffect, useRef } from "react";
import { useTangazoAd } from "../../hooks/useTangazoAd";

const ZONE = "footer_banner";
const AD_HEIGHT = 50;
const slideDuration = 5000;

// Module-scoped so an impression only fires once per session even if this
// component unmounts/remounts (e.g. route change away and back).
const impressionSeen = new Set();

export default function UniversalBanner() {
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef();
  const { isEmpty } = useTangazoAd(ZONE);
  const bannerRef = useRef(null);

  useEffect(() => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (slideDuration / 100);
        return next >= 100 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(progressIntervalRef.current);
  }, []);

  // ad_impression — IntersectionObserver, ≥50% visible for ≥1s, once per
  // session per zone (pattern C from tab 8).
  // NOTE: when isEmpty is false, the ad shown here is injected by the
  // Tangazo script into the data-tangazo-zone div — we don't have that
  // creative's ad_id/advertiser/campaign at this layer. If per-creative
  // reporting is required for live-served ads (not just the static
  // fallback), that metadata needs to come from useTangazoAd's return value
  // or a Tangazo-side callback — flag with Comfort/Pelayo.
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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4">
      <div ref={bannerRef} className="w-full max-w-2xl rounded-xl overflow-hidden shadow-md bg-gray-100">
        {isEmpty ? (
          <img
            src="/mtn-fibre-sticky-1280x160 2.jpg"
            alt="MTN Promo"
            className="w-full block"
          />
        ) : (
          <div
            data-tangazo-zone={ZONE}
          />
        )}
       
      </div>
    </div>
  );
}