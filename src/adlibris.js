import { adlibrisConfig as config, overlayConfig } from "./config.js";
import { observeUrlChange, waitForElement } from "./observers.js";
import { createForm } from "./form.js";

export { activateAdlibris };

const bannerId = "eod-bookmarklet-banner";
const checkoutContainerSelector = "b2l-checkout-container";

const labels = config.labels;

function cartRoute() {
  console.debug("cartRoute");
}

function configureRoute() {
  console.debug("configureRoute");
}

function registerRoute() {
  console.debug("registerRoute");

  const expandButtonSelector = "b2l-show-hide-products button";
  const itemSelector = "b2l-checkout-register-item";
  const quantitySelector = `.quantity-display`;
  const registerContainerSelector = `.register-item:last-child`;

  const selectNote = (label) =>
    `b2l-book-registration-property[label='${label}'] input`;

  const datePrefix = labels.datePrefix;
  const dateSuffix = labels.dateSuffix;

  const date = new Date().toISOString().slice(0, 10);

  const checkoutContainer = document.body.querySelector(
    checkoutContainerSelector,
  );

  waitForElement(checkoutContainer, expandButtonSelector, (expandButton) => {
    if (expandButton.getAttribute("aria-expanded") == "false") {
      expandButton.click();
    }

    waitForElement(checkoutContainer, itemSelector, (match) => {
      checkoutContainer.querySelectorAll(itemSelector).forEach((item) => {
        if (labels.dateNoteField) {
          item.querySelector(selectNote(labels.dateNoteField)).value = [
            labels.datePrefix,
            date,
            labels.dateSuffix,
          ].join("");
        }

        const quantity = Number(
          item.querySelector(quantitySelector).textContent,
        );

        const overlay = {
          defaults: { [config.mappings.quantity]: quantity },
        };

        const itemForm = createForm(
          overlayConfig(config, overlay),
          (str, form) => {
            item.querySelector(selectNote("Intern anmärkning")).value = str;
          },
        );

        const registerContainer = item.querySelector(registerContainerSelector);

        item.insertBefore(itemForm, item.lastChild);
      });
    });
  });
}

function purchaseRoute() {
  console.debug("purchaseRoute");
}

function handleRoute(url) {
  const routes = [
    { path: /\/checkout\/cart$/, route: cartRoute },
    { path: /\/checkout\/configure$/, route: configureRoute },
    { path: /\/checkout\/register$/, route: registerRoute },
    { path: /\/checkout\/purchase$/, route: purchaseRoute },
  ];
  const matchedRoute = routes.find(({ path }) => path.test(url));

  if (matchedRoute) {
    console.debug("Matched route", matchedRoute.path);
    matchedRoute.route();
  } else {
    console.info("Unknown page");
  }
}

function addBanner() {
  const banner = document.createElement("div");
  banner.id = bannerId;
  banner.style.backgroundColor = "#fff0f8";
  banner.style.border = "1px solid #999094";
  banner.style.textAlign = "center";
  banner.style.font = "system-ui";
  banner.textContent = labels.banner;
  document.body.insertBefore(banner, document.body.firstChild);
}

function activateAdlibris() {
  addBanner();
  observeUrlChange((newUrl) => handleRoute(newUrl));
  handleRoute(document.location.href);
}
