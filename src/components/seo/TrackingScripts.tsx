import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSeoSettings } from "@/hooks/useSeoSettings";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

const loadScript = (id: string, src: string, async = true) => {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = async;
  s.src = src;
  document.head.appendChild(s);
};

const TrackingScripts = () => {
  const settings = useSeoSettings();
  const location = useLocation();

  // Init GA4 + Meta Pixel une fois quand les IDs apparaissent
  useEffect(() => {
    const ga4 = settings.ga4_measurement_id?.trim();
    if (ga4 && !document.getElementById("ga4-loader")) {
      loadScript("ga4-loader", `https://www.googletagmanager.com/gtag/js?id=${ga4}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", ga4, { send_page_view: false });
    }

    const pixel = settings.meta_pixel_id?.trim();
    if (pixel && !document.getElementById("meta-pixel-init")) {
      const init = document.createElement("script");
      init.id = "meta-pixel-init";
      init.text = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixel}');
      `;
      document.head.appendChild(init);
    }
  }, [settings.ga4_measurement_id, settings.meta_pixel_id]);

  // Page view sur changement de route
  useEffect(() => {
    const path = location.pathname + location.search;
    if (settings.ga4_measurement_id && window.gtag) {
      window.gtag("event", "page_view", { page_path: path, page_location: window.location.href });
    }
    if (settings.meta_pixel_id && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname, location.search, settings.ga4_measurement_id, settings.meta_pixel_id]);

  return null;
};

export default TrackingScripts;