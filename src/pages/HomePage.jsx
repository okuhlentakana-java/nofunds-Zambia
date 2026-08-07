import { useEffect } from "react";
import Banner from "../components/home/Banner";
import Actions from "../components/home/Actions";
import Bundles from "../components/home/Bundles";
import PromoBanner from "../components/home/PromoBanner";
import Services from "../components/home/Services";
import SponsoredBanner from "../components/home/SponsoredBanner";

export default function HomePage() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      entry_reason: "out_of_data",
      user_tier: "gold",
      user_type: "returning",
    });
  }, []); // empty deps — fires once on mount, not on every re-render

  return (
    <div className="pb-10">
      <Banner />
      <Actions />
      <Bundles />
      <PromoBanner />
      <Services />
      <SponsoredBanner />
    </div>
  );
}