import * as config from "../out/appliedConfig.json";

export { config, adlibrisConfig, overlayConfig };

function overlayConfig(config, overlay) {
  return {
    ...config,
    defaults: { ...config.defaults, ...overlay.defaults },
    labels: { ...config.labels, ...overlay.labels },
    options: { ...config.options, ...overlay.options },
  };
}

// Merge in both default adlibris config and custom adlibris config
const adlibrisConfig = overlayConfig(config, config.adlibris);
