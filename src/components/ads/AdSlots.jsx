import { AD_PLACEMENTS } from "../../api";
import useTangazoAd from "../../hooks/useTangazoAd";

function LogoFallback({ className }) {
  return <div className={`flex items-center justify-center bg-white ${className}`}><img src={`${import.meta.env.BASE_URL}mtn-fibre-mpu-1080x500 2.jpg`} alt="MTN Fibre promotion" className="h-full w-full object-contain" /></div>;
}

function ServedAd({ placement, zone, className }) {
  const { ad, isEmpty, slotRef, handleImageError } = useTangazoAd(placement);

  if (isEmpty) return <LogoFallback className={className} />;
  if (!ad) return <div aria-label="Loading advertisement" className={className} />;

  return <div ref={slotRef} data-tangazo-zone={zone} className={`relative ${className}`}>
    <a
      href={ad.tracking?.click}
      target="_blank"
      rel="noopener sponsored noreferrer"
      aria-label={ad.creative.altText || ad.advertiser?.name || "Advertisement"}
      className="block h-full w-full"
    >
      <img
        src={ad.creative.imageUrl}
        width={ad.format?.width || undefined}
        height={ad.format?.height || undefined}
        alt={ad.creative.altText || ad.advertiser?.name || "Advertisement"}
        onError={handleImageError}
        className="h-full w-full object-contain"
      />
    </a>
    <span className="absolute right-1.5 top-1.5 rounded bg-black/45 px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-white/90">Ad</span>
  </div>;
}

function PrimaryBanner() {
  const className = "mx-auto aspect-[3/2] w-full max-w-[480px] overflow-hidden rounded-2xl";
  return <section aria-label="Advertisement" className="mx-auto w-full max-w-[480px]">
    <ServedAd placement={AD_PLACEMENTS.primary} zone="primary_banner" className={className} />
  </section>;
}

function MpuCard() {
  const className = "h-[250px] w-[300px] max-w-full overflow-hidden rounded-2xl";
  return <section aria-label="Sponsored advertisement" className="flex justify-center">
    <ServedAd placement={AD_PLACEMENTS.square} zone="square_card" className={className} />
  </section>;
}

function FooterBanner() {
  const className = "pointer-events-auto mx-auto aspect-[970/250] w-full max-w-[560px] overflow-hidden rounded-xl";
  return <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(10px,env(safe-area-inset-bottom))]">
    <ServedAd placement={AD_PLACEMENTS.footer} zone="footer_banner" className={className} />
  </div>;
}

export {
  FooterBanner,
  MpuCard,
  MpuCard as SecondaryBanner,
  PrimaryBanner
};
