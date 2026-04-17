const typeColor = {
  airtime: "text-mtn-yellow",
  data: "text-mtn-yellow",
  voice: "text-mtn-yellow",
  sms: "text-mtn-yellow",
};

export default function OptionCard({ option, onSelect }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-mtn-black">Borrow {option.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{option.validity}</p>
        </div>
        <span className={`text-xl font-black flex-shrink-0 ${typeColor[option.type] || "text-mtn-yellow"}`}>
          {option.amount}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-3 leading-relaxed">
        {option.description}. Repay {option.totalRepayment} on your next top-up.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">{option.serviceFee} service fee</p>
        <button
          onClick={() => onSelect(option)}
          className="bg-mtn-yellow text-mtn-black px-5 py-2 rounded-full font-semibold text-sm hover:bg-mtn-black hover:text-white transition"
        >
          Borrow
        </button>
      </div>
    </div>
  );
}