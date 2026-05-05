import { useState, useRef, useEffect } from "react";
import { ENDPOINTS, apiFetch } from "../../api";

export default function ConfirmScreen({ selectedOption, phoneNumber, onConfirm, onBack }) {
  const [step,        setStep]        = useState("confirm");
  const [otp,         setOtp]         = useState(["", "", "", ""]);
  const [otpError,    setOtpError]    = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [verifying,   setVerifying]   = useState(false);
  const [sending,     setSending]     = useState(false);
  const [sendError,   setSendError]   = useState("");
  const [otpId,       setOtpId]       = useState(null);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, step]);

  if (!selectedOption) return null;

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < 3) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      inputsRef.current[3]?.focus();
    }
    e.preventDefault();
  };

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setSending(true);
    setSendError("");
    try {
      const res = await apiFetch(ENDPOINTS.otp, {
        method: "POST",
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      setOtpId(res?.data?.id ?? null);
      setStep("otp");
      setResendTimer(30);
      setOtp(["", "", "", ""]);
      setOtpError("");
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setSendError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setOtp(["", "", "", ""]);
    setOtpError("");
    await sendOtp();
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      setOtpError("Please enter the 4-digit code.");
      return;
    }
    setVerifying(true);
    setOtpError("");
    try {
      await apiFetch(ENDPOINTS.otpVerify, {
        method: "POST",
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp:          code,
        }),
      });
      onConfirm();
    } catch (err) {
      setOtpError(err.message || "Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── STEP: Confirm ─────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="space-y-4">
        <div className="bg-mtn-yellow/10 rounded-2xl p-6 text-center">
          <p className="text-base font-bold text-mtn-black mb-2">Borrow {selectedOption.name}</p>
          <p className="text-5xl font-black text-mtn-yellow leading-none">{selectedOption.amount}</p>
          <p className="text-sm text-gray-400 mt-2">{selectedOption.validity}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Row label="Credit Amount"   value={selectedOption.amount} />
          <Row label="Service Fee"     value={`${selectedOption.serviceFee} service fee`} />
          <Row label="Total Repayment" value={`${selectedOption.totalRepayment} deducted on next recharge`} bold />
          <Row label="Validity"        value={selectedOption.validity} last />
        </div>

        <div className="bg-mtn-yellow/10 border border-mtn-yellow/30 rounded-xl p-4">
          <p className="text-sm text-mtn-black leading-relaxed">
            By proceeding, you agree that {selectedOption.totalRepayment} will be automatically
            deducted from your next recharge.
          </p>
        </div>

        {sendError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600 text-center">{sendError}</p>
          </div>
        )}

        <button
          onClick={sendOtp}
          disabled={sending}
          className={`w-full py-4 rounded-2xl font-bold text-base transition ${
            sending
              ? "bg-mtn-yellow/40 text-mtn-black/40 cursor-not-allowed"
              : "bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white"
          }`}
        >
          {sending ? "Sending Code…" : "Confirm Borrow"}
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition py-1"
        >
          Back
        </button>
      </div>
    );
  }

  // ── STEP: OTP ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-mtn-yellow flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#090c15"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-mtn-black">Verify It's You</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          We sent a 4-digit code to{" "}
          <span className="font-semibold text-mtn-black">{phoneNumber ?? "your registered number"}</span>.
          <br />Enter it below to complete your borrow request.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 bg-mtn-yellow/10 rounded-xl px-4 py-2.5">
        <span className="text-mtn-yellow font-black text-base">{selectedOption.amount}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-500">{selectedOption.totalRepayment} repayment</span>
      </div>

      <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className={`w-14 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all
              ${digit    ? "border-mtn-yellow bg-mtn-yellow/10 text-mtn-black" : "border-gray-200 bg-white text-gray-800"}
              ${otpError ? "border-red-400 bg-red-50" : ""}
              focus:border-mtn-yellow focus:bg-mtn-yellow/10`}
          />
        ))}
      </div>

      {otpError && (
        <p className="text-center text-sm text-red-500">{otpError}</p>
      )}

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-xs text-gray-400">
            Resend code in <span className="font-semibold text-mtn-black">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-xs text-mtn-black font-semibold hover:text-mtn-yellow transition"
          >
            Resend Code
          </button>
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={verifying || otp.join("").length < 4}
        className={`w-full py-4 rounded-2xl font-bold text-base transition ${
          verifying || otp.join("").length < 4
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white"
        }`}
      >
        {verifying ? "Verifying…" : "Verify & Confirm"}
      </button>

      <button
        onClick={() => { setStep("confirm"); setOtp(["", "", "", ""]); setOtpError(""); }}
        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition py-1"
      >
        Back
      </button>
    </div>
  );
}

function Row({ label, value, bold, last }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${!last ? "border-b border-gray-100" : ""}`}>
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm text-right max-w-[55%] ${bold ? "font-bold text-mtn-black" : "text-gray-600"}`}>
        {value}
      </span>
    </div>
  );
}