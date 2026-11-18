import { AD_PLACEMENTS } from "../../api";
import useTangazoAd from "../../hooks/useTangazoAd";

function PlaceholderAd({ className, image, alt }) {
  return <img src={`${import.meta.env.BASE_URL}${image}`} alt={alt} className={`block h-auto ${className}`} />;
}

function ServedAd({ placement, zone, className, slotClassName, fallbackClassName, fallbackImage, fallbackAlt }) {
  const { ad, isEmpty, slotRef, handleImageError } = useTangazoAd(placement);

  if (isEmpty) return <PlaceholderAd className={fallbackClassName || className} image={fallbackImage} alt={fallbackAlt} />;
  if (!ad) return <div aria-label="Loading advertisement" className={`${className} ${slotClassName}`} />;

  return <div ref={slotRef} data-tangazo-zone={zone} className={`relative ${className} ${slotClassName}`}>
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
  const className = "mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl";
  return <section aria-label="Advertisement" className="w-full mt-4 px-4">
    <ServedAd
      placement={AD_PLACEMENTS.primary}
      zone="primary_banner"
      className={className}
      slotClassName="aspect-[3/2]"
      fallbackClassName="mx-auto w-full max-w-screen-sm overflow-hidden rounded-2xl"
      fallbackImage="mtn-fibre-mpu-1080x500 2.jpg"
      fallbackAlt="MTN Fibre promotion"
    />
  </section>;
}

function MpuCard() {
  const className = "w-[300px] max-w-full overflow-hidden rounded-2xl";
  return <section aria-label="Sponsored advertisement" className="w-full mt-4 px-4 flex justify-center">
    <ServedAd
      placement={AD_PLACEMENTS.square}
      zone="square_card"
      className={className}
      slotClassName="h-[250px]"
      fallbackClassName="mx-auto w-full max-w-screen-sm overflow-hidden rounded-2xl"
      fallbackImage="mtn-fibre-inline-1080x360 2.jpg"
      fallbackAlt="MTN Fibre promotion"
    />
  </section>;
}

function FooterBanner() {
  const className = "pointer-events-auto mx-auto w-full max-w-[560px] overflow-hidden rounded-xl";
  return <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4">
    <ServedAd
      placement={AD_PLACEMENTS.footer}
      zone="footer_banner"
      className={className}
      slotClassName="aspect-[970/250]"
      fallbackClassName="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-xl bg-gray-100 shadow-md"
      fallbackImage="mtn-fibre-sticky-1280x160 2.jpg"
      fallbackAlt="MTN Fibre promotion"
    />
  </div>;
}

export {
  FooterBanner,
  MpuCard,
  MpuCard as SecondaryBanner,
  PrimaryBanner
};
