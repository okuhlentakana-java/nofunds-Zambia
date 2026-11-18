import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/universal/PaymentModal";
import { useBundlesByCategory } from "../hooks/useBundles";
import { useTangazoAd } from "../hooks/useTangazoAd";

// ── Icons ────────────────────────────────────────────────────────────────────
const BoltIcon = ({ size = 16, color = "#001A70" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const StarIcon = ({ color = "#facc15" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children, noMargin }) {
  return (
    <div className={`text-[11px] font-bold tracking-wider text-gray-400 uppercase ${noMargin ? "mb-0" : "mb-2"}`}>
      {children}
    </div>
  );
}

function CardSkeleton({ count, className }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  ));
}

function parsePrice(priceStr = "") {
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

// Label color mapping (same as Bundles page)
const labelColor = (label) => {
  switch (label) {
    case "Best Value":  return "bg-mtn-yellow text-mtn-black";
    case "Recommended": return "bg-black text-mtn-yellow";
    case "Popular":     return "bg-yellow-100 text-yellow-800";
    case "Night":       return "bg-gray-900 text-white";
    case "Voice":       return "bg-gray-200 text-gray-800";
    case "Social":      return "bg-yellow-200 text-mtn-black";
    default:            return "bg-gray-100 text-gray-700";
  }
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function HotOffers() {
  const { isEmpty } = useTangazoAd("primary_banner");
  const navigate = useNavigate();
  const [paymentBundle, setPaymentBundle] = useState(null);

  const { bundles: dataBundles, loading: loadingData } = useBundlesByCategory("data");
  const { bundles: nightBundles, loading: loadingNight } = useBundlesByCategory("night");
  const { bundles: socialBundles, loading: loadingSocial } = useBundlesByCategory("social");

const sortedData = [...dataBundles].sort((a, b) => a.sizeMb - b.sizeMb);
const bestValue = [
  ...sortedData.filter(b => b.label === "Best Value"),
  ...sortedData.filter(b => b.label !== "Best Value"),
].slice(0, 4);

const nightDeals = [...nightBundles]
  .sort((a, b) => a.sizeMb - b.sizeMb)
  .slice(0, 3);

const socialDeals = [
  socialBundles.find(b => b.subCategory === "daily"),
  socialBundles.find(b => b.subCategory === "weekly"),
  socialBundles.find(b => b.subCategory === "monthly"),
]
  .filter(Boolean)
  .sort((a, b) => a.sizeMb - b.sizeMb);

  // view_item_list — one push per carousel/section, once it has content to show.
  useEffect(() => {
    if (loadingData || bestValue.length === 0) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "view_item_list", item_list_name: "best_value_deals" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData, bestValue.length]);

  useEffect(() => {
    if (loadingNight || nightDeals.length === 0) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "view_item_list", item_list_name: "night_deals" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingNight, nightDeals.length]);

  useEffect(() => {
    if (loadingSocial || socialDeals.length === 0) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "view_item_list", item_list_name: "social_deals" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSocial, socialDeals.length]);

  const quickBuy = (bundle) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "select_item",
      item_id: bundle.code,
      item_name: bundle.name,
      price: parsePrice(bundle.price),
      currency: "ZMW",
    });
    setPaymentBundle({
      name: bundle.name,
      description: bundle.description,
      components: bundle.components,
      price: bundle.price,
      validity: bundle.validity,
      code: bundle.code,
    });
  };

  // Helper to render a card using the same design as Bundles page
  const renderCard = (bundle, isNight = false) => (
    <div
      key={bundle.id}
      onClick={() => quickBuy(bundle)}
      className="rounded-xl p-2 flex flex-col justify-between bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer"
    >
      {/* Label */}
      <span className={`inline-block w-fit text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelColor(bundle.label)}`}>
        {bundle.label}
      </span>

      {/* Bundle name */}
      {bundle.components?.length > 0 ? (
        <div className="mt-1 text-xs font-bold leading-snug text-gray-900">
          {bundle.components.map((component) => (
            <div key={component}>{component}</div>
          ))}
        </div>
      ) : (
        <div className="mt-1 text-sm font-bold leading-tight text-gray-900">
          {bundle.name}
        </div>
      )}

      {/* Validity */}
      <p className="text-[10px] text-gray-400 leading-tight">
        {bundle.validity}
      </p>

      {/* Price & button */}
      <div className="flex items-center justify-between mt-2 gap-1">
        <span className="font-bold text-xs text-gray-900">
          {bundle.price}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); quickBuy(bundle); }}
          className="text-[10px] font-semibold px-2 py-1 rounded-full bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white active:scale-95 transition whitespace-nowrap"
        >
          Buy
        </button>
      </div>
    </div>
  );

  // For Night deals – keep the dark background but same card structure & sizes
  const renderNightCard = (bundle) => (
    <div
      key={bundle.id}
      onClick={() => quickBuy(bundle)}
      className="rounded-xl p-2 flex flex-col justify-between bg-mtn-black border border-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer"
    >
      <span className={`inline-block w-fit text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelColor(bundle.label)}`}>
        {bundle.label}
      </span>
      <div className="mt-1 text-sm font-bold leading-tight text-white">
        {bundle.name}
      </div>
      <p className="text-[10px] text-gray-400 leading-tight">
        {bundle.validity}
      </p>
      <div className="flex items-center justify-between mt-2 gap-1">
        <span className="font-bold text-xs text-mtn-yellow">
          {bundle.price}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); quickBuy(bundle); }}
          className="text-[10px] font-semibold px-2 py-1 rounded-full bg-mtn-yellow text-mtn-black hover:bg-white hover:text-mtn-black active:scale-95 transition whitespace-nowrap"
        >
          Buy
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Hero Banner */}
        <div className="rounded-2xl overflow-hidden mb-6 max-w-screen-sm mx-auto">
          {isEmpty ? (
            <img src="/mtn-fibre-inline-1080x360 2.jpg" alt="MTN Promo" className="w-full h-auto block" />
          ) : (
            <div data-tangazo-zone="primary_banner" />
          )}
        </div>

        {/* ── Best Value Deals ─────────────────────────────────────────────── */}
        <SectionLabel>Best Value Deals</SectionLabel>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {loadingData ? (
            <CardSkeleton count={4} className="h-28" />
          ) : bestValue.length === 0 ? (
            <p className="col-span-2 text-center text-xs text-gray-400 py-4">No data bundles available</p>
          ) : (
            bestValue.map(b => renderCard(b))
          )}
        </div>

        {/* ── Night Deals ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <SectionLabel noMargin>Night Deals (11pm–5am)</SectionLabel>
          <button onClick={() => navigate("/bundles")} className="text-mtn-yellow text-sm font-semibold hover:text-mtn-black transition">
            See All →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {loadingNight ? (
            <CardSkeleton count={3} className="h-28" />
          ) : nightDeals.length === 0 ? (
            <p className="col-span-3 text-center text-xs text-gray-400 py-4">No night bundles available</p>
          ) : (
            nightDeals.map(b => renderNightCard(b))
          )}
        </div>

        {/* ── Social Media Deals ───────────────────────────────────────────── */}
        <SectionLabel>Social Media Deals</SectionLabel>
        <div className="grid grid-cols-1 gap-2">
          {loadingSocial ? (
            <CardSkeleton count={3} className="h-20" />
          ) : socialDeals.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">No social bundles available</p>
          ) : (
            socialDeals.map(b => renderCard(b))
          )}
        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!paymentBundle}
        onClose={() => setPaymentBundle(null)}
        item={paymentBundle}
        onSuccess={() => setPaymentBundle(null)}
      />
    </div>
  );
}