// This file is an alternative entry point without the adlibris functionality.
// Mainly useful during development.
import { config } from "./config.js";
import { createForm } from "./form.js";

const myForm = createForm(config, (str, form) => {
  if (window.prompt(config.labels.copyPrompt, str)) {
    form.remove();
  }
});
myForm.style.position = "fixed";
myForm.style.zIndex = "1000000";

document.body.insertBefore(myForm, document.body.firstChild);
