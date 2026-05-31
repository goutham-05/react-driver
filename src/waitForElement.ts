/**
 * Polls the DOM using MutationObserver until a CSS selector matches an element
 * or the timeout expires. Used to pause the tour after a navigation until the
 * next step's target is rendered.
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("[react-driver] waitForElement is not available in SSR"));
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`[react-driver] timed out waiting for "${selector}" (${timeout}ms)`));
    }, timeout);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
