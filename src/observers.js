export { observeUrlChange, waitForElement };

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

function waitForElement(targetElement, selector, callback) {
  let debounceTimer;

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

  const debounceCallback = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(observerCallback, 100);
  };

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
