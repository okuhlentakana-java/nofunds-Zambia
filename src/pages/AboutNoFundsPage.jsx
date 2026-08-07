import { useNavigate } from "react-router-dom";

const actions = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    title: "Recharge Airtime",
    sub: "Top up your balance via MTN Mobile Money (MoMo) or Card",
    to: "/recharge",
    cta: "recharge",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Buy Data Bundles",
    sub: "Choose from daily, weekly, monthly, social, and night bundles",
    to: "/bundles",
    cta: "buy_data",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/>
      </svg>
    ),
    title: "Borrow Credit",
    sub: "Get emergency airtime, data, voice, or SMS on credit (XtraTime)",
    to: "/credit",
    cta: "borrow_xtratime",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: "Access Services",
    sub: "Use digital services from MTN Zambia",
    to: "/services",
    cta: "access_services",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Stay Protected",
    sub: "Subscribe to MTN Sure insurance and other protective services",
    to: "/services",
    cta: "stay_protected",
  },
];

export default function AboutNoFunds() {
  const navigate = useNavigate();

  // NOTE: "cta" allowed values in tab 6 are recharge|buy_data|borrow_xtratime only.
  // access_services and stay_protected are NOT yet in the spec — confirm with
  // Comfort/Pelayo whether to add them or map them onto an existing value.
  const trackCta = (cta) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "cta_click", cta });
  };

  const handleActionClick = (action) => {
    trackCta(action.cta);
    navigate(action.to);
  };

  const handleGetStarted = () => {
    trackCta("get_started");
    navigate("/");
  };

  return (
    <div className="w-full bg-gray-100 font-sans">
      <div className="max-w-[600px] mx-auto px-4 py-4 pb-8 box-border">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-mtn-black text-center mb-4 py-8 px-5">
          <div className="absolute -top-8 -right-8 w-[140px] h-[140px] rounded-full bg-white/5" />
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="#FFCC00" stroke="none"/>
            </svg>
          </div>
          <div className="font-extrabold text-2xl text-white mb-2">
            No Funds Portal
          </div>
          <div className="text-sm text-white/80 leading-relaxed max-w-[280px] mx-auto">
            Your free gateway to stay connected when your data runs out
          </div>
        </div>

        {/* What is it */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
          <div className="font-bold text-base text-mtn-black mb-3">
            What is the No Funds Portal?
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            The No Funds Portal is a free, zero-rated service from MTN Zambia. When your mobile data balance reaches zero, you are automatically redirected to this portal where you can access essential services without any data charges.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            This means you are never truly disconnected. Even with zero balance, you can purchase new bundles, recharge your airtime, borrow emergency credit, or access key digital services — all for free.
          </p>
        </div>

        {/* What You Can Do */}
        <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
          What You Can Do
        </div>

        <div className="flex flex-col gap-2.5 mb-6">
          {actions.map((a, i) => (
            <div
              key={i}
              onClick={() => handleActionClick(a)}
              className="bg-white rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm cursor-pointer"
            >
              <div className="w-10 h-10 shrink-0 bg-mtn-black rounded-xl flex items-center justify-center text-mtn-yellow">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-mtn-black">{a.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{a.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="w-full py-4 bg-mtn-yellow text-mtn-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-mtn-black hover:text-white mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Get Started
        </button>

        <p className="text-center text-xs text-gray-400">
          Powered by MTN Zambia. This portal is completely free to use.
        </p>

      </div>
    </div>
  );
}