import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { BASE_URL } from "../../api/index";

const ZAMBIA = { code: "ZM", dial: "+260" };
const MAX_PHONE_DIGITS = 9;
const MTN_PREFIXES_2 = ["95", "96", "97", "76"];
const PENDING_TIMEOUT_SECONDS = 240; // 4 minutes

const paymentMethods = [
  {
    id: "momo",
    label: "MTN MoMo",
    desc: "Pay from MTN Mobile Money",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    bg: "#FFCC00",
  },
];

function parseAmount(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(priceStr) {
  if (!priceStr) return "";
  return priceStr.replace(/M\s*/i, "ZK");
}

function extractPendingMessage(data) {
  const candidates = [data?.status, data?.message, data?.error];
  for (const c of candidates) {
    if (typeof c === "string" && c.toLowerCase().includes("pending")) {
      return c;
    }
  }
  return null;
}

async function checkPaymentStatus(reference) {
  try {
    const res = await fetch(`${BASE_URL}/sm-api/productManagement/v1/getTransactionStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference }),
    });
    
    const data = await res.json().catch(() => ({}));
    
    const status = (data?.status || "").toString().toLowerCase();
    const code = data?.code || "";
    
    if (status === "success" || code === "0") {
      return { done: true, ok: true, message: data?.message };
    }
    
    if (status === "fail" || code === "2084" || code.startsWith("20")) {
      return { 
        done: true, 
        ok: false, 
        message: data?.message || data?.error || "Transaction failed" 
      };
    }
    
    if (status === "pending") {
      return { done: false };
    }
    
    return { done: false };
  } catch (error) {
    return { done: false };
  }
}

// Infers the GA4 "type" param (data|voice|social|night|airtime) for the
// purchase event. item.type is used if the caller supplied it; otherwise we
// fall back to a guess based on whether the item has a bundle `code`.
// TODO: BundlesPage/HotOffers/RechargePage currently don't pass an explicit
// `type` on the item object they hand to this modal, so voice/social/night
// bundles will all get misreported as "data" below. Recommend adding
// `type: bundle.category` (or similar) at each call site instead of
// inferring it here — flag with Comfort/Pelayo which value each bundle
// category should map to in tab 6's allowed list.
function inferPurchaseType(item) {
  if (item.type) return item.type;
  return item.code ? "data" : "airtime";
}

export default function PaymentModal({ isOpen, onClose, item, onSuccess }) {
  const [method, setMethod] = useState("momo");
  const [methodOpen, setMethodOpen] = useState(false);
  const [localPhone, setLocalPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [reference, setReference] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(PENDING_TIMEOUT_SECONDS);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const purchaseTrackedRef = useRef(false);

  // Modified: Keep modal open if success, error, or pending is true
  if ((!isOpen && !success && !error && !pending) || !item) return null;

  const selected = paymentMethods.find((m) => m.id === method);
  const isMomo = method === "momo";
  const localDigits = localPhone.replace(/\D/g, "");

  const buildFullPhone = (raw) => `${ZAMBIA.dial}${raw.replace(/\D/g, "")}`;

  const isValidMTNNumber = (digits) => {
    if (digits.length !== MAX_PHONE_DIGITS) return false;
    return MTN_PREFIXES_2.includes(digits.slice(0, 2));
  };

  const canSubmit = () => {
    if (isMomo) return isValidMTNNumber(localDigits);
    return localDigits.length >= 7;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanupTimers = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeout = () => {
    cleanupTimers();
    setTimeoutExpired(true);
    setPending(false);
    setError("Payment confirmation timed out. Please check your transaction status or try again.");
  };

  const handleCancelPayment = () => {
    cleanupTimers();
    setPending(false);
    setError("Payment cancelled by user.");
  };

  useEffect(() => {
    if (!pending || !reference) return;

    setTimeRemaining(PENDING_TIMEOUT_SECONDS);
    setTimeoutExpired(false);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(reference);
        if (!result.done) return;

        cleanupTimers();
        
        if (result.ok) {
          setPending(false);
          setSuccess(true);
          // REMOVED: onSuccess() call here - will be called when user clicks "Done"
        } else {
          setPending(false);
          setError("Payment failed. Please try again.");
        }
      } catch {
        // Network hiccup — don't fail the payment over a single missed poll
      }
    }, 4000);

    return () => {
      cleanupTimers();
    };
  }, [pending, reference]);

  // purchase — fires once, the moment `success` becomes true, keyed off
  // `reference` as the idempotency guard (transaction_id) so a re-render of
  // the success screen can never double-push the same purchase.
  useEffect(() => {
    if (!success || !reference || purchaseTrackedRef.current) return;
    purchaseTrackedRef.current = true;

    const amount = parseAmount(item.price);
    const type = inferPurchaseType(item);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      transaction_id: reference,
      value: amount,
      currency: "ZMW",
      type,
      payment_method: method, // only "momo" is wired up currently
      is_first_purchase: false, // TODO: no client-side signal for this yet —
      // needs an account/history flag from the backend if tab 6 requires it accurately
      items: [
        {
          item_id: item.code || "airtime_topup",
          item_name: item.name,
          item_category: type,
          price: amount,
          quantity: 1,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, reference]);

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
    setPending(false);
    setPendingMessage("");
    setTimeoutExpired(false);
    setTimeRemaining(PENDING_TIMEOUT_SECONDS);

    const fullPhone = buildFullPhone(localPhone);

    try {
      const ref = `${Date.now()}-${localDigits}`;
      setReference(ref);

      const res = await fetch(`${BASE_URL}/api/v1/recharges/bundles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsor_phone_number: fullPhone,
          beneficiary_phone_number: fullPhone,
          reference: ref,
          bundle_code: item.code,
          payment_method: "momo",
        }),
      });

      const data = await res.json().catch(() => ({}));

      const pendingMsg = extractPendingMessage(data);
      if (pendingMsg) {
        setLoading(false);
        setPending(true);
        setPendingMessage(pendingMsg);
        return;
      }

      if (!res.ok) {
        throw new Error("Recharge failed. Please try again.");
      }

      setLoading(false);
      setSuccess(true);
      // REMOVED: onSuccess() call here - will be called when user clicks "Done"
    } catch (err) {
      setLoading(false);
      setError( "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    cleanupTimers();
    
    // Call onSuccess only when user clicks "Done" on success screen
    if (success && onSuccess) {
      onSuccess();
    }
    
    setMethod("momo");
    setMethodOpen(false);
    setLocalPhone("");
    setLoading(false);
    setSuccess(false);
    setError("");
    setPending(false);
    setPendingMessage("");
    setReference("");
    setTimeRemaining(PENDING_TIMEOUT_SECONDS);
    setTimeoutExpired(false);
    purchaseTrackedRef.current = false; // allow tracking again for the next purchase in this modal instance
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
              onClick={handleClose}
              className="w-full py-3 bg-mtn-yellow text-mtn-black rounded-xl font-bold hover:bg-mtn-black hover:text-mtn-yellow transition"
            >
              Done
            </button>
          </div>
        )}

        {/* PENDING */}
        {pending && !success && !timeoutExpired && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-mtn-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#B8860B" strokeWidth="2.5"
                className="animate-spin"
                style={{ animationDuration: "1.4s" }}
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-mtn-black mb-1">Payment Pending</h3>
            <p className="text-gray-400">
              {pendingMessage && pendingMessage.toLowerCase() !== "pending"
                ? pendingMessage
                : "A prompt has been sent to your phone. Approve it there to complete this purchase."}
            </p>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Time remaining</p>
              <p className="text-2xl font-bold text-mtn-black font-mono">
                {formatTime(timeRemaining)}
              </p>
            </div>
            
            <p className="text-xs text-gray-300 mt-4">This will update automatically once confirmed.</p>
            
            <button
              onClick={handleCancelPayment}
              className="mt-6 px-6 py-2 border border-gray-300 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
            >
              Cancel Payment
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && !success && !pending && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-mtn-black mb-1">
              {timeoutExpired ? "Payment Timeout" : error === "Payment cancelled by user." ? "Payment Cancelled" : "Payment Unsuccessful"}
            </h3>
            <p className="text-gray-400 mb-6"></p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
              {error !== "Payment cancelled by user." && (
                <button
                  onClick={() => {
                    setError("");
                    setTimeoutExpired(false);
                    setTimeRemaining(PENDING_TIMEOUT_SECONDS);
                  }}
                  className="flex-1 py-3 bg-mtn-yellow text-mtn-black rounded-xl font-bold hover:bg-mtn-black hover:text-mtn-yellow transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT FORM */}
        {!success && !error && !pending && (
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
              {item.description && (
                <p className="text-xs text-white/40 mt-2">{item.description}</p>
              )}
            </div>

            {/* Payment method */}
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
              Payment Method
            </p>
            <div className="relative mb-5">
              <button
                onClick={() => setMethodOpen(!methodOpen)}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white hover:border-mtn-yellow transition"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: selected?.bg }}
                >
                  {selected?.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-mtn-black text-sm">{selected?.label}</div>
                  <div className="text-xs text-gray-400">{selected?.desc}</div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${methodOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                        setError("");
                      }}
                      className={`w-full flex items-center gap-3 p-3 transition ${
                        method === m.id ? "bg-mtn-yellow/10" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: m.bg }}
                      >
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

            {/* Phone */}
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
              MTN MoMo Number
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
                <span className="font-bold text-mtn-black font-mono">
                  {buildFullPhone(localPhone)}
                </span>
              </p>
            )}
            {localDigits.length === MAX_PHONE_DIGITS && !isValidMTNNumber(localDigits) && (
              <p className="text-xs text-red-500 mt-1 mb-1">
                Please enter a valid MTN Zambia number (076, 095, 096, or 097).
              </p>
            )}

            <p className="text-xs text-gray-400 mb-4">
              A payment prompt will be sent to your MTN MoMo number.
            </p>

            {/* Total */}
            <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-100">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="text-xl font-extrabold text-mtn-black">{formatPrice(item.price)}</span>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!canSubmit() || loading}
              className={`w-full py-3 rounded-xl font-bold transition ${
                canSubmit() && !loading
                  ? "bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-mtn-yellow"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Confirm Purchase"}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}