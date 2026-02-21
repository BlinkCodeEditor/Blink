import { trackEvent } from "@aptabase/electron/renderer";
import pkg from "../../package.json";

export const initGA = () => {
  // Aptabase is automatically initialized in main.ts, so we just track that the app started in the renderer
  trackEvent("app_started", { version: pkg.version });
};

export const handleDownloadEvent = () => {
  trackEvent("download", { version: pkg.version });
};

export const logPageView = () => {
  // HashRouter keeps the path in window.location.hash
  const hash = window.location.hash;
  const path = (hash && hash.startsWith('#/')) ? hash.substring(1) : "/";
  trackEvent("view_screen", { route: path });
};

export const logEvent = (category: string, action: string, label: string) => {
  trackEvent(action, { category, label });
};