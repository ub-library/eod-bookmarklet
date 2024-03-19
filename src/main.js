import { config } from "./config.js";
import { createForm } from "./form.js";
import { activateAdlibris } from "./adlibris.js";

if (document.location.href.match(/\/www\.adlibris\.com\//)) {
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
