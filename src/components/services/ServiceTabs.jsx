const tabs = [
  { id: "all", label: "All Services" },
  { id: "games", label: "Games" },
  { id: "video", label: "Video" },
  { id: "connectivity", label: "Connectivity" },
  { id: "lifestyle", label: "Lifestyle" },
];

export default function ServiceTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex justify-center flex-wrap gap-2 pb-2 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-mtn-yellow text-mtn-black shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-mtn-yellow hover:text-mtn-yellow"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}