import { config } from "./config.js";
import { createForm } from "./form.js";

const myForm = createForm(config, (str, form) => {
  if (window.prompt(config.labels.copyPrompt, str)) {
    form.remove();
  }
});

document.body.insertBefore(myForm, document.body.firstChild);
