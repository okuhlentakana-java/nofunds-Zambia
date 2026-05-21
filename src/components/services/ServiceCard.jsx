import { useState } from "react";

const TypeIcon = ({ type }) => {
  const cls = "w-5 h-5";
  if (type === "games") return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.4.959.4v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  );
  if (type === "video") return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
  if (type === "digital") return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
  if (type === "lifestyle") return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
  // default / content
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
};

const iconBg = "bg-mtn-yellow/10 text-mtn-yellow";

export default function ServiceCard({ service, isActive, onActivate }) {
  const [expanded, setExpanded] = useState(false);

  const isSubscribe = service.action === "subscribe";
  const isCallertune = service.action === "callertune";
  const originalBtnLabel = isSubscribe ? "Subscribe" : isCallertune ? "Activate" : "Access";

  const btnLabel = isActive ? "Active" : originalBtnLabel;
  const btnColor = isActive
    ? "bg-green-600 hover:bg-green-700 text-white"
    : isSubscribe
    ? "bg-mtn-yellow text-mtn-black hover:bg-mtn-black hover:text-white"
    : "bg-mtn-black text-white hover:bg-gray-800";

  const handleAction = () => {
    if (isActive) return;
    if (service.url) {
      window.open(service.url, "_blank", "noopener,noreferrer");
    }
    onActivate();
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
        expanded ? "border-2 border-mtn-black" : "border border-gray-100"
      } bg-white`}
    >
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <TypeIcon type={service.type} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold text-mtn-black text-sm leading-tight">{service.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{service.description}</p>
        </div>
        <span className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${btnColor}`}>
          {btnLabel}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{service.fullDescription}</p>

          {service.features && (
            <div className="space-y-2 mb-5">
              {service.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mtn-yellow flex-shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          )}

          {isCallertune && (
            <p className="text-xs text-gray-500 mb-3">
              Dial <span className="font-bold text-mtn-black">{service.ussd}</span> to activate Callertunes.
            </p>
          )}

          {isActive ? (
            <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm font-semibold text-green-600">Activated Successfully</span>
            </div>
          ) : service.plans ? (
            <div className="flex gap-2">
              {service.plans.map((plan) => (
                <button
                  key={plan}
                  onClick={handleAction}
                  className="flex-1 bg-mtn-yellow text-mtn-black py-3 rounded-xl text-sm font-bold hover:bg-mtn-black hover:text-white transition"
                >
                  {plan}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleAction}
              className="w-full bg-mtn-yellow text-mtn-black py-3 rounded-xl text-sm font-bold hover:bg-mtn-black hover:text-white transition"
            >
              {isCallertune ? `Dial ${service.ussd}` : `Access ${service.name}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}