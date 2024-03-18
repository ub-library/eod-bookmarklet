import * as userConfig from "../config.json";
import * as defaultLabels from "./defaultLabels.json";

export { config, adlibrisConfig, overlayConfig };

function overlayConfig(config, overlay) {
  return {
    ...config,
    defaults: { ...config.defaults, ...overlay.defaults },
    labels: { ...config.labels, ...overlay.labels },
    options: { ...config.options, ...overlay.options },
  };
}

const config = {
  ...userConfig,
  labels: { ...defaultLabels, ...userConfig.labels },
};
const adlibrisConfig = overlayConfig(config, config.adlibris);
