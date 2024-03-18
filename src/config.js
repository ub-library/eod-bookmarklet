import * as userConfig from "../config.json";
import * as defaultConfig from "./defaultConfig.json";

export { config, adlibrisConfig, overlayConfig };

function overlayConfig(config, overlay) {
  return {
    ...config,
    defaults: { ...config.defaults, ...overlay.defaults },
    labels: { ...config.labels, ...overlay.labels },
    options: { ...config.options, ...overlay.options },
  };
}

// First merge at top level, then at the level of allowed overlays
const config = overlayConfig(
  { ...defaultConfig, ...userConfig },
  overlayConfig(defaultConfig, userConfig),
);
const adlibrisConfig = overlayConfig(config, config.adlibris);
