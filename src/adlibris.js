import { adlibrisConfig as config, overlayConfig } from "./config.js";
import { observeUrlChange, waitForElement, debounce } from "./observers.js";
import { createForm } from "./form.js";

export { activateAdlibris };

const labels = config.labels;
const settings = config.adlibris.settings;

const bannerId = "eod-bookmarklet-banner";

const checkoutContainerSelector = "b2l-checkout-container";
const itemDetailsSelector = "b2l-product-item-info";
const cartSelector = "b2l-cart";

const prices = {};

const pageObservers = [];

function clearPageObservers() {
  pageObservers.forEach((observer) => {
    observer.disconnect();
  });
  pageObservers.length = 0;
}

function getQuantityPurchase(item) {
  return Number(
    item.querySelector(".product-item__quantity").textContent.match(/(\d+)/)[1],
  );
}

function getQuantityCart(item) {
  return Number(item.querySelector("b2l-quantity input").value);
}

function extractPrice(element) {
  return Number(
    ((element.textContent.match(/\d+,\d+/) || [])[0] || "-").replace(",", "."),
  );
}

function getPrices(parent) {
  console.debug("Getting prices");

  const itemSelector = `${parent} .product-item`;

  let getQuantity;
  if (parent == cartSelector) {
    getQuantity = getQuantityCart;
  } else {
    getQuantity = getQuantityPurchase;
  }
  waitForElement(document.body, itemSelector, (_) => {
    document.querySelectorAll(itemSelector).forEach((item) => {
      const itemDetails = item.querySelector(itemDetailsSelector).textContent;
      const itemQuantity = getQuantity(item);
      const itemTotal = extractPrice(
        item.querySelector(".product-item-price__price"),
      );
      const equipmentTotal =
        extractPrice(item.querySelector(".product-item-price__legal")) || 0;
      if (itemTotal && itemQuantity) {
        prices[itemDetails] = {
          price: itemTotal / itemQuantity,
          equipment: equipmentTotal / itemQuantity,
        };
        console.debug("Got prices", prices);
      } else {
        console.warn(
          "Failed to get prices",
          itemTotal,
          itemQuantity,
          equipmentTotal,
        );
      }
    });
  });
}

function cartRoute() {
  console.debug("cartRoute");

  getPrices("b2l-cart");
}

function updatePrices(newEquipmentPrice) {
  for (const [key, oldPrice] of Object.entries(prices)) {
    if (oldPrice.equipment == newEquipmentPrice) return;
    prices[key] = {
      price: oldPrice.price - oldPrice.equipment + newEquipmentPrice,
      equipment: newEquipmentPrice,
    };
  }
}

function configureRoute() {
  console.debug("configureRoute");

  const headerSelector = ".configure-group-area .group-header";

  waitForElement(document, headerSelector, (header) => {
    const container = header.parentNode.parentNode;

    const getCurrentEquipmentPrice = () => {
      return extractPrice(container.querySelector(headerSelector)) || 0;
    };

    let equipmentPrice = getCurrentEquipmentPrice();
    updatePrices(equipmentPrice);

    const checkEquipmentPrice = () => {
      const previousPrice = equipmentPrice;
      equipmentPrice = getCurrentEquipmentPrice();
      if (equipmentPrice != previousPrice) {
        updatePrices(equipmentPrice);
      }
    };

    const observer = new MutationObserver(debounce(checkEquipmentPrice));
    observer.observe(container, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    pageObservers.push(observer);
  });
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

  let warning = false;

  waitForElement(checkoutContainer, expandButtonSelector, (expandButton) => {
    if (expandButton.getAttribute("aria-expanded") == "false") {
      expandButton.click();
    }

    waitForElement(checkoutContainer, itemSelector, (match) => {
      checkoutContainer.querySelectorAll(itemSelector).forEach((item) => {
        if (settings.dateNoteField) {
          const input = item.querySelector(selectNote(settings.dateNoteField));
          input.value = [labels.datePrefix, date, labels.dateSuffix].join("");
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        const itemDetails = item.querySelector(itemDetailsSelector).textContent;

        const price = prices[itemDetails] || {};

        if (!price.price) {
          warning = labels.noPrice;
        } else if (price.equipment == 0) {
          warning = labels.noEquipment;
        }

        const quantity = item.querySelector(quantitySelector).textContent;

        const overlay = {
          defaults: {
            [config.mappings.quantity]: quantity,
            [config.mappings.price]: price.price,
          },
        };

        const itemForm = createForm(
          overlayConfig(config, overlay),
          (str, form) => {
            const input = item.querySelector(selectNote("Intern anmärkning"));
            input.value = str;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          },
        );

        const registerContainer = item.querySelector(registerContainerSelector);

        item.insertBefore(itemForm, item.lastChild);
      });

      if (warning) {
        alert(warning);
      }
    });
  });
}

function purchaseRoute() {
  console.debug("purchaseRoute");
  getPrices("b2l-cart-summary");
}

function handleRoute(url) {
  const routes = [
    { path: /\/checkout\/cart$/, route: cartRoute },
    { path: /\/checkout\/configure$/, route: configureRoute },
    { path: /\/checkout\/register$/, route: registerRoute },
    { path: /\/checkout\/purchase$/, route: purchaseRoute },
  ];
  const matchedRoute = routes.find(({ path }) => path.test(url));

  clearPageObservers();

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
  banner.style.font = "caption";
  banner.textContent = labels.banner;
  document.body.insertBefore(banner, document.body.firstChild);
}

function activateAdlibris() {
  if (!document.getElementById(bannerId)) {
    addBanner();
    observeUrlChange((newUrl) => handleRoute(newUrl));
    handleRoute(document.location.href);
  }
}
