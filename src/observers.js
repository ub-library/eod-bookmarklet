export { observeUrlChange, waitForElement, debounce };

function observeUrlChange(callback) {
  let oldHref = document.location.href;
  const observer = new MutationObserver((mutations) => {
    const newHref = document.location.href;
    if (oldHref !== newHref) {
      oldHref = newHref;
      callback(newHref);
    }
  });
  observer.observe(document.querySelector("body"), {
    childList: true,
    subtree: true,
  });

  return observer;
}

function debounce(fn, wait = 100) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

function waitForElement(targetElement, selector, callback) {
  // biome-ignore lint/style/useConst: Required for putting in scope
  let observer;
  const observerCallback = () => {
    const foundElement = targetElement.querySelector(selector);
    if (foundElement) {
      if (observer) observer.disconnect();
      callback(foundElement);
      return true;
    }
  };

  if (observerCallback()) {
    return;
  }

  const debounceCallback = debounce(observerCallback);

  observer = new MutationObserver(debounceCallback);
  observer.observe(targetElement, {
    childList: true,
    attributes: true,
    subtree: true,
  });

  return observer;
}

// Usage example
//const targetElement = document.getElementById("specific-container"); // Adjust the target element as needed
//waitForElement(targetElement, ".target-class", (element) => {
//  console.log("Element found:", element);
//  // Perform actions with the found element
//});

// The returned observer from waitForElement can be disconnected manually if needed, like so:
// observer.disconnect();
