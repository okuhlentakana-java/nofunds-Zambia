import { useState, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import PaymentModal from "../components/universal/PaymentModal";
import { BUNDLE_GROUPS, compareBundles } from "../api/bundleHelpers";
import { useBundles } from "../hooks/useBundles";

const subCategories = [
  { id: "hourly", label: "Hourly" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "non-expiry", label: "Non expiry" },
];

const labelColor = (label) => {
  switch (label) {
    case "Best Value":    return "bg-mtn-yellow text-mtn-black";
    case "Recommended":  return "bg-mtn-black text-mtn-yellow";
    case "Popular":      return "bg-mtn-yellow/20 text-mtn-black";
    case "Night":        return "bg-mtn-black text-white";
    case "Voice":        return "bg-gray-100 text-mtn-black";
    case "Social":       return "bg-mtn-yellow/30 text-mtn-black";
    case "SMS":           return "bg-mtn-yellow/30 text-mtn-black";
    case "Combo":         return "bg-mtn-black text-white";
    default:             return "bg-gray-100 text-gray-600";
  }
};

export default function BundlesPage() {
  const { bundles, loading, error } = useBundles({ network_operator_country: "ZM" });
  const [activeSub, setActiveSub] = useState("daily");
  const [activeGroup, setActiveGroup] = useState("mixo-mixo");
  const [selectedBundle, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredBundles = bundles
    .filter(bundle =>
      bundle.bundleGroup === activeGroup && bundle.subCategory === activeSub
    )
    .sort(compareBundles);

  // view_item_list — fires whenever the visible filtered list changes
  // (main tab or sub tab switch), once loading is done and there's content to show.
  useEffect(() => {
    if (loading || filteredBundles.length === 0) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "view_item_list",
      item_list_name: activeGroup,
      filter: activeSub,
      bundle_group: activeGroup,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSub, activeGroup, loading, filteredBundles.length]);

  const handleBuy = (bundle) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "select_item",
      item_id: bundle.code,
      item_name: bundle.name,
      item_category: bundle.category || activeGroup,
      price: parseFloat(String(bundle.price).replace(/[^0-9.]/g, "")) || 0,
      currency: "ZMW",
    });
    setSelected(bundle);
    setShowModal(true);
  };

  const paymentItem = selectedBundle
    ? {
        name: selectedBundle.name,
        description: selectedBundle.description,
        components: selectedBundle.components,
        price: selectedBundle.price,
        validity: selectedBundle.validity,
        code: selectedBundle.code, 
      }
    : null;

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-mtn-yellow border-t-transparent" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load bundles</p>
        <button
          onClick={() => window.location.reload()}
          className="text-mtn-black font-semibold underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 mt-6 pb-10">

        {/* Bundle Group Tabs */}
        <div className="-mx-4 mb-3 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6">
          <div className="flex w-max min-w-full gap-1 rounded-xl bg-gray-200 p-1">
            {BUNDLE_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveGroup(group.id);
                    setActiveSub("daily");
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeGroup === group.id
                      ? "bg-mtn-yellow text-mtn-black shadow-sm"
                      : "text-gray-600 hover:text-mtn-black"
                  }`}
                >
                  {group.label}
                </button>
            ))}
          </div>
        </div>

        {/* Validity Tabs */}
        <div className="-mx-4 mb-8 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6">
          <div className="flex w-max min-w-full justify-start gap-2">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSub(sub.id)}
                className={`shrink-0 whitespace-nowrap rounded-xl px-5 py-2 text-sm font-medium transition ${
                  activeSub === sub.id
                    ? "bg-mtn-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-mtn-black"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bundles Grid */}
        {filteredBundles.length === 0 ? (
          <div className="text-center py-12">
            <FiFilter className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No bundles match your filters</p>
            <button
              onClick={() => {
                setActiveSub("daily");
                setActiveGroup("mixo-mixo");
              }}
              className="text-mtn-black font-semibold underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
            {filteredBundles.map((bundle) => (
              <div
                key={bundle.id}
                className="rounded-xl p-2 flex flex-col justify-between
                bg-white border border-gray-100 shadow-sm
                hover:border-mtn-yellow hover:shadow-md hover:scale-[1.02] transition"
              >
                <span className={`inline-block w-fit text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${labelColor(bundle.label)}`}>
                  {bundle.label}
                </span>

                {bundle.components?.length > 0 ? (
                  <div className="mt-1 text-xs font-bold text-mtn-black leading-snug">
                    {bundle.components.map((component) => (
                      <div key={component}>{component}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-sm font-bold text-mtn-black">{bundle.name}</div>
                )}
                <p className="text-[10px] text-gray-400">{bundle.validity}</p>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-xs text-mtn-black">{bundle.price}</span>
                  <button
                    onClick={() => handleBuy(bundle)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full
                    bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white
                    active:scale-95 transition"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && paymentItem && (
        <PaymentModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setSelected(null); }}
          item={paymentItem}
          onSuccess={() => { setShowModal(false); setSelected(null); }}
        />
      )}
    </>
  );
}