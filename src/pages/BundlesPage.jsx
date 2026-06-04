import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { RiStackLine } from "react-icons/ri";
import { PiLightning } from "react-icons/pi";
import { IoCallOutline } from "react-icons/io5";
import { BsChat } from "react-icons/bs";
import { BiSolidMoon } from "react-icons/bi";
import { RxMixerHorizontal } from "react-icons/rx";
import CustomBundleBuilder from "../components/bundles/CustomBundleBuilder";
import PaymentModal from "../components/universal/PaymentModal";
import { useBundles } from "../hooks/useBundles";

const mainCategories = [
  { id: "all", label: <><RiStackLine className="inline ml-1"/> All</> },
  { id: "data", label: <><PiLightning className="inline ml-1"/> Data</> },
  { id: "voice", label: <><IoCallOutline className="inline ml-1"/> Voice</> },
  { id: "social", label: <><BsChat className="inline ml-1"/> Social</> },
  { id: "night", label: <><BiSolidMoon className="inline ml-1"/> Night</> },
  { id: "custom", label: <><RxMixerHorizontal className="inline ml-1"/> Custom Mix</> },
];

const subCategories = [
  { id: "daily", label: "Daily" },
  { id: "3-day", label: "3-Day" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const labelColor = (label) => {
  switch (label) {
    case "Best Value":    return "bg-mtn-yellow text-mtn-black";
    case "Recommended":  return "bg-mtn-black text-mtn-yellow";
    case "Popular":      return "bg-mtn-yellow/20 text-mtn-black";
    case "Night":        return "bg-mtn-black text-white";
    case "Voice":        return "bg-gray-100 text-mtn-black";
    case "Social":       return "bg-mtn-yellow/30 text-mtn-black";
    default:             return "bg-gray-100 text-gray-600";
  }
};

export default function BundlesPage() {
  const { bundles, loading, error } = useBundles({ network_operator_country: "ZM" });
  const [activeMain, setActiveMain] = useState("all");
  const [activeSub, setActiveSub] = useState("daily");
  const [selectedBundle, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredBundles = (() => {
    if (activeMain === "custom") return [];
    if (activeMain === "all") return bundles.filter(b => b.subCategory === activeSub);
    return bundles.filter(b => b.category === activeMain && b.subCategory === activeSub);
  })();

  const handleBuy = (bundle) => {
    setSelected(bundle);
    setShowModal(true);
  };

  const paymentItem = selectedBundle
    ? {
        name: selectedBundle.name,
        description: selectedBundle.description,
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

        {/* Main Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 flex-wrap gap-0.5">
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveMain(cat.id); setActiveSub("daily"); }}
                className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                  activeMain === cat.id
                    ? "bg-mtn-yellow text-mtn-black shadow-sm"
                    : "text-gray-500 hover:text-mtn-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        {activeMain !== "custom" && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-2 flex-wrap">
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSub(sub.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
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
        )}

        {/* Custom Builder */}
        {activeMain === "custom" && <CustomBundleBuilder />}

        {/* Bundles Grid */}
        {activeMain !== "custom" && (
          filteredBundles.length === 0 ? (
            <div className="text-center py-12">
              <FiFilter className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No bundles match your filters</p>
              <button
                onClick={() => setActiveSub("daily")}
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

                  <div className="mt-1 text-sm font-bold text-mtn-black">{bundle.name}</div>
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
          )
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