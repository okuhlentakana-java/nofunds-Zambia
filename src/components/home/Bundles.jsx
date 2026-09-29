import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import PaymentModal from "../universal/PaymentModal";
import { useBundles } from "../../hooks/useBundles";

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

function pickSix(bundles) {
 
  const sorted = [...bundles].sort((a, b) => a.sizeMb - b.sizeMb);

  const bestValue = sorted.filter(b => b.label === "Best Value");
  const rest      = sorted.filter(b => b.label !== "Best Value");

  return [...bestValue, ...rest].slice(0, 6);
}

export default function Bundles() {
  const navigate = useNavigate();
  const { bundles, loading, error } = useBundles({ network_operator_country: "ZM" });

  const [selectedBundle, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const preview = pickSix(bundles);

  const handleBuy = (bundle) => {
    setSelected(bundle);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelected(null);
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

  // 🔄 Loading State
  if (loading) return (
    <div className="px-4 sm:px-6 mt-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Recommended</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-2 bg-white border border-gray-100 shadow-sm h-24 animate-pulse"
          >
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );

  // ❌ Error State
  if (error) return (
    <div className="px-4 sm:px-6 mt-3 text-center py-6">
      <p className="text-xs text-red-400">Could not load bundles</p>
    </div>
  );

  return (
    <>
      <div className="px-4 sm:px-6 mt-3">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800 text-sm">
            Recommended
          </h2>

          <button
            onClick={() => navigate("/bundles")}
            className="flex items-center gap-1 text-yellow-500 text-xs font-semibold hover:text-yellow-600 transition"
          >
            See All <FaArrowRight size={10} />
          </button>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-3 gap-2">
          {preview.map((bundle) => (
            <div
              key={bundle.id}
              className="rounded-xl p-2 flex flex-col justify-between 
              bg-white border border-gray-100 shadow-sm 
              hover:shadow-md hover:scale-[1.02] transition"
            >
              
              {/* Label */}
              <span
                className={`inline-block w-fit text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelColor(bundle.label)}`}
              >
                {bundle.label}
              </span>

              {/* Bundle Info */}
              <div className="mt-1 text-sm font-bold leading-tight text-gray-900">
                {bundle.name}
              </div>

              <p className="text-[10px] text-gray-400 leading-tight">
                {bundle.validity}
              </p>

              {/* Price + Button */}
              <div className="flex items-center justify-between mt-2 gap-1">
                <span className="font-bold text-xs text-gray-900">
                  {bundle.price}
                </span>

                <button
                  onClick={() => handleBuy(bundle)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full 
                  bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white 
                  active:scale-95 transition whitespace-nowrap"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && paymentItem && (
        <PaymentModal
          isOpen={showModal}
          onClose={handleClose}
          item={paymentItem}
          onSuccess={handleClose}
        />
      )}
    </>
  );
}