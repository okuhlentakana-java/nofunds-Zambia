import { FaArrowRight } from "react-icons/fa";
import { LuGamepad2, LuTv, LuMegaphone, LuMusic } from "react-icons/lu";
import { MdOutlineSportsEsports } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const services = [
  {
    name: "Swipe & Win",
    icon: <MdOutlineSportsEsports />,
    description: "Swipe for a chance to win K5,000 in prizes daily.",
    url: "http://mtnzmb.swipe4win.com",
  },
  {
    name: "MTN TV",
    icon: <LuTv />,
    description: "Stream live TV and on-demand content on your phone.",
    url: "https://onetv1.mtn.com/",
  },
  {
    name: "Callertunes",
    icon: <LuMusic />,
    description: "Set your favourite song as your caller tune via *560#.",
    url: null, // USSD — no web URL
    ussd: "*560#",
  },
  {
    name: "Games",
    icon: <LuGamepad2 />,
    description: "MobiBattle, Xgames, Challenges Arena and more.",
    url: "http://mtnzmb.livexgames.com",
  },
];

export default function Services() {
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (service.url) {
      window.open(service.url, "_blank", "noopener,noreferrer");
    } else if (service.ussd) {
      window.open(`tel:${service.ussd}`);
    }
  };

  return (
    <div className="px-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800 text-base">Popular Services</h2>
        <button
          onClick={() => navigate("/services")}
          className="flex items-center gap-1 text-yellow-400 text-sm font-medium hover:text-mtn-black"
        >
          View All <FaArrowRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {services.map((service, i) => (
          <div
            key={i}
            onClick={() => handleServiceClick(service)}
            className="bg-white rounded-2xl p-4 flex flex-col items-start shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="text-2xl mb-2 text-yellow-400">{service.icon}</div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{service.name}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{service.description}</p>
          </div>
        ))}

        <div
          onClick={() => navigate("/ads")}
          className="bg-gradient-to-br from-mtn-yellow to-mtn-yellow rounded-2xl p-4 flex flex-col items-start shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer col-span-2"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <LuMegaphone size={18} className="text-mtn-black" />
            </div>
            <span className="text-mtn-black text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full">
              Advertising
            </span>
          </div>
          <p className="font-bold text-mtn-black text-sm mt-3">Advertise With Us</p>
          <p className="text-xs text-mtn-black mt-1 leading-relaxed">
            Reach thousands of active MTN users. Place your brand where it matters.
          </p>
          <div className="flex items-center gap-1 mt-3 text-mtn-black text-xs font-semibold">
            Get Started <FaArrowRight size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}