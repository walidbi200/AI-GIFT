import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    if (window.gtag) {
      window.gtag("config", "G-5VXMXKEYEV", {
        page_path: location.pathname + location.search,
        page_title: getPageTitle(location.pathname),
      });
    }
  }, [location]);

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case "/":
        return "Home - Smart Gift Finder";
      case "/about":
        return "About - Smart Gift Finder";
      case "/contact":
        return "Contact - Smart Gift Finder";
      default:
        return "Smart Gift Finder";
    }
  };

  // Function to track custom events
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number,
  ) => {
    if (window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Function to track gift generation
  const trackGiftGeneration = (
    occasion: string,
    relationship: string,
    interestsCount: number,
  ) => {
    trackEvent(
      "gift_generation",
      "engagement",
      `${occasion}_${relationship}`,
      interestsCount,
    );
  };

  // Function to track form submission
  const trackFormSubmission = (formType: "contact" | "feedback") => {
    trackEvent("form_submission", "engagement", formType);
  };

  return {
    trackEvent,
    trackGiftGeneration,
    trackFormSubmission,
  };
};
