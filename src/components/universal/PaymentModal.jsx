import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CiCreditCard1 } from "react-icons/ci";
import { BACKEND_URL } from "../../api/index";

const ZAMBIA = { code: "ZM", dial: "+260" };
const MAX_PHONE_DIGITS = 9;

// MTN Zambia prefixes
const MTN_PREFIXES = ["095", "096", "097", "076"];

const paymentMethods = [
  {
    id: "ecocash",
    label: "EcoCash",
    desc: "Pay from mobile wallet",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    bg: "#16a34a",
  },
  {
    id: "card",
    label: "Card (PayFast)",
    desc: "Debit or credit card",
    icon: <CiCreditCard1 className="w-5 h-5 text-white" />,
    bg: "#000000",
  },
];

function parseAmount(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(priceStr) {
  if (!priceStr) return "";
  // Replace 'M' (case‑insensitive, optional spaces) with 'ZK'
  return priceStr.replace(/M\s*/i, "ZK");
}

function loadPayFastEngine() {
  return new Promise((resolve) => {
    if (window.payfast_do_onsite_payment) return resolve();
    const script = document.createElement("script");
    script.src = "https://www.payfast.co.za/onsite/engine.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

export default function PaymentModal({ isOpen, onClose, item, onSuccess }) {
  const [method, setMethod] = useState("ecocash");
  const [methodOpen, setMethodOpen] = useState(false);
  const [localPhone, setLocalPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if ((!isOpen && !success && !error) || !item) return null;

  const selected = paymentMethods.find((m) => m.id === method);
  const isMobile = method === "ecocash";
  const isCard = method === "card";
  const localDigits = localPhone.replace(/\D/g, "");

  const buildFullPhone = (raw) => `${ZAMBIA.dial}${raw.replace(/\D/g, "")}`;

  const isValidMTNNumber = (digits) => {
    if (digits.length !== MAX_PHONE_DIGITS) return false;
    const prefix = digits.slice(0, 3);
    return MTN_PREFIXES.includes(prefix);
  };

  const canSubmit = () => isValidMTNNumber(localDigits);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, "");
    const digits = raw.replace(/\D/g, "");
    if (digits.length > MAX_PHONE_DIGITS) return;
    setLocalPhone(raw);
  };

  const handleConfirm = async () => {
    if (!canSubmit()) return;
    setLoading(true);
    setError("");
    const fullPhone = buildFullPhone(localPhone);

    try {
      if (isCard) {
        await loadPayFastEngine();
        const res = await fetch(`${BACKEND_URL}/api/payment/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            itemName: item.name,
            amount: parseAmount(item.price),
            phone: fullPhone,
            email: email.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error("Server error — could not initiate payment.");
        const data = await res.json();
        if (!data.uuid) throw new Error("No payment identifier returned from server.");
        setLoading(false);
        onClose();
        window.payfast_do_onsite_payment({ uuid: data.uuid }, (result) => {
          if (result === true || result === "true" || result === 1) {
            setSuccess(true);
          } else {
            setError(
              result === false || result === null
                ? "Payment was cancelled. Please try again."
                : "Payment failed. Please try again."
            );
          }
        });
      } else {
        // Simulate mobile money (EcoCash) payment
        await new Promise((r) => setTimeout(r, 1300));
        setLoading(false);
        setSuccess(true);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setMethod("ecocash");
    setMethodOpen(false);
    setLocalPhone("");
    setEmail("");
    setLoading(false);
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* SUCCESS */}
        {success && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-mtn-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-mtn-black mb-1">Payment Successful!</h3>
            <p className="text-gray-400 mb-4">Your {item.name} has been activated.</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-5 space-y-2">
              {[
                ["Bundle", item.name],
                ["Amount Paid", formatPrice(item.price)],
                ["Method", selected?.label],
                ["Phone", buildFullPhone(localPhone)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="font-semibold text-mtn-black text-sm">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (onSuccess) onSuccess();
                handleClose();
              }}
              className="w-full py-3 bg-mtn-yellow text-mtn-black rounded-xl font-bold hover:bg-mtn-black hover:text-mtn-yellow transition"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && !success && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-mtn-black mb-1">Payment Unsuccessful</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => setError("")}
                className="flex-1 py-3 bg-mtn-yellow text-mtn-black rounded-xl font-bold hover:bg-mtn-black hover:text-mtn-yellow transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT FORM */}
        {!success && !error && (
          <div className="p-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-mtn-black">Payment</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Bundle summary */}
            <div className="bg-mtn-black rounded-xl p-4 mb-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-xs text-white/50 mt-1">{item.validity}</p>
                </div>
                <p className="font-extrabold text-mtn-yellow">{formatPrice(item.price)}</p>
              </div>
              {item.description && <p className="text-xs text-white/40 mt-2">{item.description}</p>}
            </div>

            {/* Payment method label */}
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Payment Method</p>

            {/* Method dropdown */}
            <div className="relative mb-5">
              <button
                onClick={() => setMethodOpen(!methodOpen)}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white hover:border-mtn-yellow transition"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selected?.bg }}>
                  {selected?.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-mtn-black text-sm">{selected?.label}</div>
                  <div className="text-xs text-gray-400">{selected?.desc}</div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${methodOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {methodOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMethod(m.id);
                        setMethodOpen(false);
                        setLocalPhone("");
                        setEmail("");
                        setError("");
                      }}
                      className={`w-full flex items-center gap-3 p-3 transition ${
                        method === m.id ? "bg-mtn-yellow/10" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                        {m.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-mtn-black text-sm">{m.label}</div>
                        <div className="text-xs text-gray-400">{m.desc}</div>
                      </div>
                      {method === m.id && (
                        <svg className="w-4 h-4 text-mtn-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone number */}
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
              {isMobile ? "Mobile Money Number (MTN)" : "Mobile Number"}
            </p>
            <input
              type="tel"
              placeholder="97 123 4567"
              value={localPhone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl
                focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow
                outline-none text-mtn-black text-sm mb-1"
            />
            {localDigits.length > 0 && (
              <p className="text-xs text-gray-400 mb-1">
                Full number:{" "}
                <span className="font-bold text-mtn-black font-mono">{buildFullPhone(localPhone)}</span>
              </p>
            )}
            {localDigits.length === MAX_PHONE_DIGITS && !isValidMTNNumber(localDigits) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid MTN Zambia number (starting with 095, 096, 097, or 076).
              </p>
            )}

            {/* Email – card only */}
            {isCard && (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1 mt-3">
                  Email Address <span className="font-normal normal-case text-gray-400">(optional)</span>
                </p>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl
                    focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow
                    outline-none text-mtn-black mb-3"
                />
                <div className="bg-mtn-yellow/10 border border-mtn-yellow/30 rounded-xl p-3 mb-2 flex items-start gap-2">
                  <svg className="w-4 h-4 text-mtn-black mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
                    />
                  </svg>
                  <p className="text-xs text-mtn-black">
                    {email.trim()
                      ? "A receipt will be sent to your email."
                      : "Add an email above to receive a receipt."}
                  </p>
                </div>
              </>
            )}

            <p className="text-xs text-gray-400 mb-4">
              {isMobile
                ? "A payment prompt will be sent to this MTN Zambia number."
                : "Complete your card payment in the secure overlay."}
            </p>

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="text-xl font-extrabold text-mtn-black">{formatPrice(item.price)}</span>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!canSubmit() || loading}
              className={`w-full py-3 rounded-xl font-bold transition ${
                canSubmit() && !loading
                  ? "bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (isCard ? "Loading PayFast..." : "Processing...") : isCard ? "Pay with Card →" : "Confirm Purchase"}
            </button>

            {isCard && (
              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2H10v-2c0-1.1.9-2 2-2zm-6 9V10a6 6 0 1112 0v10H6z"
                  />
                </svg>
                Secured by PayFast · PCI DSS Compliant
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}