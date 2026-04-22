import TrackingScripts from "./TrackingScripts";
import { useSeoRedirects } from "@/hooks/useSeoRedirects";

/** Composant unique à monter dans <BrowserRouter> pour tracking + redirections. */
const SeoGlobal = () => {
  useSeoRedirects();
  return <TrackingScripts />;
};

export default SeoGlobal;