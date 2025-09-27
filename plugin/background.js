// Endpoint to POST when a checkout page is detected
const WEBHOOK_URL = "https://example.com/api/checkout-trigger"; // TODO: replace with your API URL

// Inject on pages that likely relate to checkout: URL contains "/checkout" OR
// broader keywords so the content script can run DOM heuristics.
function shouldTrigger(urlStr) {
  try {
    const url = new URL(urlStr);
    const pathAndQuery = `${url.pathname}${url.search}`.toLowerCase();
    if (pathAndQuery.includes("/checkout")) return true;
    const patterns = [
      /cart/, /payment/, /billing/, /shipping/, /place[-_ ]?order/, /confirm/, /order[-_ ]?summary/
    ];
    return patterns.some((re) => re.test(pathAndQuery));
  } catch {
    return false;
  }
}
  
  // Debounce map so we only trigger once per final load
  const triggered = new Set();
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url) return;
    if (!shouldTrigger(tab.url)) return;
  
    const key = `${tabId}@${tab.url}`;
    if (triggered.has(key)) return;
    triggered.add(key);
  
    // Inject content script into the page
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: false },
        files: ["content.js"]
      });
      // Example: show a badge so you can see it ran
      chrome.action.setBadgeText({ tabId, text: "ON" });
    } catch (e) {
      console.error("Injection failed", e);
    }
  });
  
  // Optional cleanup when tab changes away
  chrome.tabs.onRemoved.addListener(() => triggered.clear());

// Receive confirmation from the content script and POST to API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "checkout_detected") {
    const payload = {
      url: sender?.tab?.url || message.url || null,
      title: message.title || sender?.tab?.title || null,
      detectedAt: new Date().toISOString(),
      tabId: sender?.tab?.id || null,
      source: "content",
      signals: message.signals || {},
      userAgent: navigator.userAgent
    };

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // mode: "cors" // default; requires host_permissions for destination
    })
      .then(async (res) => {
        const ok = res.ok;
        const text = await res.text().catch(() => "");
        if (!ok) {
          console.warn("Webhook responded with non-OK status", res.status, text);
        }
        sendResponse({ ok, status: res.status });
      })
      .catch((err) => {
        console.error("Webhook POST failed", err);
        sendResponse({ ok: false, error: String(err) });
      });
    return true; // keep the message channel open for async sendResponse
  }
});
  