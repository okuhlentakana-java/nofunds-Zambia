import { useState } from "react";
import ServiceTabs from "../components/services/ServiceTabs";
import ServiceCard from "../components/services/ServiceCard";

const services = {
  all: [
    {
      id: 1,
      name: "MTN TV",
      description: "Stream live TV and on-demand content on your phone.",
      fullDescription: "Watch live television and on-demand content anywhere, anytime on your mobile device.",
      features: ["Live TV streaming", "On-demand content", "Mobile viewing"],
      action: "access",
      type: "content",
      url: "https://onetv1.mtn.com/",
    },
    {
      id: 2,
      name: "Swipe & Win",
      description: "Swipe to stand a chance to win amazing prizes daily.",
      fullDescription: "Play Swipe & Win for a chance to win K5,000 and other amazing prizes every day.",
      features: ["Daily prizes", "Win up to K5,000", "Easy to play"],
      plans: ["Daily", "Weekly", "Monthly"],
      action: "subscribe",
      type: "games",
      url: "http://mtnzmb.swipe4win.com",
    },
    {
      id: 3,
      name: "Challenges Arena",
      description: "Compete in challenges and win exciting rewards.",
      fullDescription: "Enter competitive challenges, test your skills, and win exciting rewards.",
      features: ["Competitive challenges", "Skill-based games", "Win rewards"],
      action: "access",
      type: "games",
      url: "https://mtnzmca.onmohub.com",
    },
    {
      id: 4,
      name: "MobiBattle",
      description: "Battle other players in thrilling mobile game tournaments.",
      fullDescription: "Join intense mobile game battles and tournaments against players across the network.",
      features: ["PvP battles", "Tournaments", "Live leaderboards"],
      action: "access",
      type: "games",
      url: "https://mtnzmb.mobibattle.com/",
    },
    {
      id: 5,
      name: "Xgames",
      description: "Access a wide variety of exciting mobile games.",
      fullDescription: "Explore and play a huge library of exciting mobile games across all genres.",
      features: ["Wide game library", "Multiple genres", "Regular new titles"],
      action: "access",
      type: "games",
      url: "http://mtnzmb.livexgames.com",
    },
    {
      id: 6,
      name: "Inconcert",
      description: "Exclusive music and concert video content on demand.",
      fullDescription: "Watch exclusive concert footage, music videos, and live performances on demand.",
      features: ["Concert videos", "Music content", "On-demand viewing"],
      action: "access",
      type: "video",
      url: "http://acq.vas.ac/4923",
    },
    {
      id: 7,
      name: "MTN Chef",
      description: "Discover delicious recipes and cooking tips on your phone.",
      fullDescription: "Browse hundreds of recipes, cooking tutorials, and food inspiration right on your phone.",
      features: ["Recipe library", "Cooking tutorials", "Food inspiration"],
      action: "access",
      type: "video",
      url: "http://zm.mtnchef.club/",
    },
    {
      id: 8,
      name: "Callertunes",
      description: "Set your favourite song as your caller tune.",
      fullDescription: "Personalise your phone with a caller tune your contacts hear when they call you.",
      features: ["Wide music selection", "Easy activation", "Regular updates"],
      action: "callertune",
      type: "digital",
      ussd: "*560#",
    },
    {
      id: 9,
      name: "WeCare",
      description: "Health and wellness tips and support services.",
      fullDescription: "Access health tips, wellness content, and support services to keep you and your family healthy.",
      features: ["Health tips", "Wellness support", "Family care"],
      action: "access",
      type: "lifestyle",
      url: "http://wecare.mobi/ZMBMTN/wecare/",
    },
    {
      id: 10,
      name: "Funny Bone",
      description: "Daily jokes, comedy clips, and entertainment to brighten your day.",
      fullDescription: "Get your daily dose of laughs with jokes, comedy clips, and fun entertainment.",
      features: ["Daily jokes", "Comedy clips", "Fun content"],
      action: "access",
      type: "lifestyle",
      url: "http://mtnfunnybone.com",
    },
  ],
  games: [],
  video: [],
  digital: [],
  lifestyle: [],
};

// Populate sub-category arrays from the master list
["games", "video", "digital", "lifestyle"].forEach((cat) => {
  services[cat] = services.all.filter((s) => s.type === cat);
});

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeServices, setActiveServices] = useState({});

  const handleActivate = (serviceId) => {
    setActiveServices((prev) => ({ ...prev, [serviceId]: true }));
  };

  const currentServices = services[activeTab] || services.all;

  return (
    <div className="px-4 sm:px-6 mt-6 pb-10">
      <ServiceTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="grid grid-cols-1 gap-4">
        {currentServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isActive={!!activeServices[service.id]}
            onActivate={() => handleActivate(service.id)}
          />
        ))}
      </div>
    </div>
  );
}