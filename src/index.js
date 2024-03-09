import * as config from "../config.json";
import { createForm } from "./form.js";

function override(config, overrides) {
  return {
    ...config,
    options: { ...config.options, ...overrides.options },
    defaults: { ...config.defaults, ...overrides.defaults },
  };
}

myForm = createForm(
  override(config, config.overrides.some_vendor),
  (str, form) => {
    if (window.prompt(str, str)) {
      document.body.removeChild(form);
    }
  },
);

document.body.insertBefore(myForm, document.body.firstChild);
