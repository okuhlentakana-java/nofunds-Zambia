import { FaCheck } from "react-icons/fa";

export default function SuccessScreen({ selectedOption, onDone }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="w-20 h-20 bg-mtn-yellow rounded-full flex items-center justify-center mx-auto">
        <FaCheck className="text-black text-4xl" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-mtn-black mb-2">Credit Approved</h2>
        <p className="text-gray-500">
          Borrow {selectedOption?.name} has been credited to your account.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Repayment: {selectedOption?.totalRepayment} deducted on next recharge
        </p>
      </div>
      <button
        onClick={onDone}
        className="bg-mtn-yellow text-mtn-black px-6 py-3 rounded-xl font-semibold hover:bg-mtn-black hover:text-white transition"
      >
        Done
      </button>
    </div>
  );
}