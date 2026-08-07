import { useState } from "react";
import ServiceTabs from "../components/services/ServiceTabs";
import ServiceCard from "../components/services/ServiceCard";

const services = {
  all: [
    {
      id: "1",
      name: "MTN One TV",
      description: "MTN's TV streaming platform with live TV, movies, and series.",
      fullDescription: "Stream live TV channels, catch up on movies, series, and sports events on MTN One TV – your all-in-one entertainment hub.",
      features: [
        "Live TV channels",
        "Movies & series",
        "Sports coverage",
        "On-demand content"
      ],
      action: "access",
      type: "video",
      url: "https://onetv1.mtn.com/"
    },
    {
      id: "2", 
      name: "MyMTN",
      description: "MTN Zambia's self-service customer application.",
      fullDescription: "Manage your MTN account, buy bundles, check balances, view usage, access offers, and manage your mobile services from a single application.",
      features: [
        "Account management",
        "Bundle purchases",
        "Balance enquiry",
        "Usage monitoring",
        "SIM security services"
      ],
      action: "access",
      type: "lifestyle",
      url: "https://www.mtn.zm/mymtn/"
    },
    {
      id: "3",
      name: "MTN MoMo",
      description: "MTN Zambia's mobile money platform.",
      fullDescription: "Send and receive money, buy airtime and bundles, pay bills, make merchant payments, access savings and loan products, and perform financial transactions securely from your mobile phone.",
      features: [
        "Money transfers",
        "Bill payments",
        "Merchant payments",
        "Savings",
        "Loans",
        "International remittances"
      ],
      action: "access",
      type: "financial",
      url: "https://www.mtn.zm/momo/"
    },
    {
      id: "4",
      name: "Mixo Mixo",
      description: "Combined voice, SMS and data bundle service.",
      fullDescription: "A converged telecommunications bundle allowing customers to purchase voice minutes, data, SMS and streaming allocations in a single package.",
      features: [
        "Voice minutes",
        "Data bundles",
        "SMS bundles",
        "Daily bundles",
        "Weekly bundles",
        "Monthly bundles"
      ],
      action: "purchase",
      type: "connectivity",
      url: "https://www.mtn.zm/personal-home/mixo-mixo/"
    },
    {
      id: "5",
      name: "MTN Enterprise",
      description: "Business and enterprise communications solutions.",
      fullDescription: "Corporate connectivity, IoT, cloud, communications and managed business services for enterprises.",
      features: [
        "Business connectivity",
        "Enterprise internet",
        "IoT solutions",
        "Managed services"
      ],
      action: "access",
      type: "lifestyle",
      url: "https://www.mtn.zm/business/"
    },
  ],
  games: [],
  video: [],
  connectivity: [],
  lifestyle: [],
};

// Populate sub-category arrays from the master list
["games", "video", "connectivity", "lifestyle"].forEach((cat) => {
  services[cat] = services.all.filter((s) => s.type === cat);
});

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeServices, setActiveServices] = useState({});

  const handleActivate = (service) => {
    // service_action — covers MoMo activate / Kongola apply / card subscribe /
    // app download per tab 5 event #26. "action" here reuses the service's
    // own `action` field (access|purchase) as the value.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "service_action",
      service: service.name,
      action: service.action,
    });
    setActiveServices((prev) => ({ ...prev, [service.id]: true }));
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
            onActivate={() => handleActivate(service)}
          />
        ))}
      </div>
    </div>
  );
}