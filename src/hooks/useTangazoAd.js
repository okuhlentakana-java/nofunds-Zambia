import { useEffect, useRef, useState } from "react";
import { AD_API_KEY, AD_BASE_URL } from "../api";

function getAudienceId() {
  try {
    return localStorage.getItem("visitorId") || undefined;
  } catch (error) {
    console.warn("Could not read the visitor ID; ad frequency capping may not apply.", error);
    return undefined;
  }
}

export default function useTangazoAd(placement) {
  const [adState, setAdState] = useState(() => ({
    placement,
    ad: null,
    isEmpty: !AD_BASE_URL || !AD_API_KEY,
  }));
  const slotRef = useRef(null);
  const currentState = adState.placement === placement
    ? adState
    : { ad: null, isEmpty: !AD_BASE_URL || !AD_API_KEY };
  const ad = currentState.ad;

  useEffect(() => {
    if (!AD_BASE_URL || !AD_API_KEY) {
      console.warn("Tangazo ad serving is not configured; showing the local fallback.");
      return undefined;
    }

    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    async function fetchAd() {
      try {
        const response = await fetch(`${AD_BASE_URL.replace(/\/$/, "")}/api/v1/serve/ad`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": AD_API_KEY,
          },
          body: JSON.stringify({
            placement,
            platform: "web",
            deviceType: window.innerWidth < 768 ? "mobile" : "desktop",
            language: navigator.language,
            audienceId: getAudienceId(),
          }),
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || `Ad request failed (${response.status}).`);
        }
        if (!result.fill) {
          if (active) setAdState({ placement, ad: null, isEmpty: true });
          return;
        }
        if (result.creative?.type !== "image" || !result.creative.imageUrl) {
          throw new Error(`Placement "${placement}" returned an unsupported creative type.`);
        }

        if (active) setAdState({ placement, ad: result, isEmpty: false });
      } catch (error) {
        if (error.name === "AbortError" && !timedOut) return;
        const requestError = timedOut ? new Error("Ad request timed out.") : error;
        console.error(`Could not load ad for placement "${placement}".`, requestError);
        if (active) setAdState({ placement, ad: null, isEmpty: true });
      }
    }

    fetchAd();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [placement]);

  useEffect(() => {
    if (!ad?.tracking?.impressionPixel || !slotRef.current) return undefined;
    const image = slotRef.current.querySelector("img");
    if (!image) return undefined;
    if (!("IntersectionObserver" in window)) {
      console.warn("Impression tracking requires IntersectionObserver.");
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        new Image().src = ad.tracking.impressionPixel;
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(image);
    return () => observer.disconnect();
  }, [ad]);

  const handleImageError = () => {
    console.error(`The ad creative for placement "${placement}" failed to load.`);
    setAdState((current) => current.placement === placement
      ? { placement, ad: null, isEmpty: true }
      : current);
  };

  return { ...currentState, slotRef, handleImageError };
}