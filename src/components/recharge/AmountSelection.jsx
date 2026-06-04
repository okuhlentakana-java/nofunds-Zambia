import { FaArrowRight } from "react-icons/fa";
import { useTangazoAd } from "../../hooks/useTangazoAd";
const GiftIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const amounts = [
  { value: 5, label: "ZK5", description: "Quick Top-up" },
  { value: 10, label: "ZK10", description: "Basic" },
  { value: 20, label: "ZK20", description: "Standard" },
  { value: 30, label: "ZK30", description: "Plus" },
  { value: 50, label: "ZK50", description: "Value" },
  { value: 100, label: "ZK100", description: "Premium" },
  { value: 200, label: "ZK200", description: "Power" },
  { value: 500, label: "ZK500", description: "Max" },
];

export default function AmountSelection({ selectedAmount, customAmount, onAmountSelect, onCustomAmountChange }) {
  const { isEmpty } = useTangazoAd("primary_banner");
  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onCustomAmountChange(value);
    }
  };

  return (
    <div className="space-y-6">
          {/* Hero Banner — max width + height constrained */}
      <div className="rounded-2xl overflow-hidden mb-6 max-w-screen-sm mx-auto">
        {isEmpty ? (
          <img
            src="/mtn-fibre-inline-1080x360 2.jpg"
            alt="MTN Promo"
            className="w-full h-auto block"
          />
        ) : (
          <div
            data-tangazo-zone="primary_banner"
          />
        )}
      </div>
  

     <div>
  <h2 className="text-lg font-bold text-mtn-black mb-4">SELECT AMOUNT</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
    {amounts.map((amount) => (
      <button
        key={amount.value}
        onClick={() => onAmountSelect(amount.value)}
        className={`p-4 rounded-xl border-2 text-left transition ${
          selectedAmount === amount.value
            ? "border-mtn-yellow bg-mtn-yellow text-mtn-black"
            : "border-gray-200 bg-white hover:border-yellow-300"
        }`}
      >
        <div className={`font-bold text-lg ${
          selectedAmount === amount.value ? "text-mtn-black" : "text-gray-800"
        }`}>
          {amount.label}
        </div>
        <div className={`text-xs ${
          selectedAmount === amount.value ? "text-mtn-black" : "text-gray-500"
        }`}>
          {amount.description}
        </div>
      </button>
    ))}
  </div>
</div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          OR ENTER CUSTOM AMOUNT
        </label>
        
        <div className="relative">
       
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}