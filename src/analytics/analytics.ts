import ReactGA from "react-ga4";
import pkg from "../../package.json";

const TRACKING_ID = "G-Z2N6XZFT4E";

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID, {
    gaOptions: {
      checkProtocol: false // It's important for Electron
    }
  });
};

export const handleDownloadEvent = () => {
    const version = pkg.version;
    ReactGA.event({
        category: "Downloads",
        action: "Download",
        label: "Download",
        value: parseInt(version)
    })
}

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label: string) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};