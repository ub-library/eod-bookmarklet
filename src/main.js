import { activateAdlibris } from "./adlibris.js";
import { config } from "./config.js";
import { createForm } from "./form.js";

if (document.location.hostname.match(/(^|\.)adlibris\.com$/)) {
  activateAdlibris();
} else {
  const myForm = createForm(config, (str, form) => {
    if (window.prompt(config.labels.copyPrompt, str)) {
      form.remove();
    }
  });
  myForm.style.position = "fixed";
  myForm.style.zIndex = "1000000";

  document.body.insertBefore(myForm, document.body.firstChild);
}
