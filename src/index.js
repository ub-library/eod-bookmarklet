import * as config from "../config.json";
import { createForm } from "./form.js";

myForm = createForm(config, (str, form) => {
  const label = (config.labels || {}).copyPrompt || "Copy the generated code";
  if (window.prompt(label, str)) {
    form.remove();
  }
});

document.body.insertBefore(myForm, document.body.firstChild);
