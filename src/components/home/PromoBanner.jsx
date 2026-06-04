import { useTangazoAd } from "../../hooks/useTangazoAd";

export default function PromoBanner() {
  const { isEmpty } = useTangazoAd("primary_banner");

  return (
    <div className="w-full mt-4 px-4">
      <div className="rounded-2xl overflow-hidden max-w-screen-sm mx-auto">
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