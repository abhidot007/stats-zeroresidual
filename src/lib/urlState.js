// Minimal URL query-param sync — no router dependency, matching the rest
// of this app's hand-rolled-hook style. Uses replaceState (not pushState)
// so selecting players doesn't spam the browser history; the goal here
// is a shareable link at any given moment, not back-button navigation
// through every search.
export function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

// Merge `patch` into the current query string. A value of null/undefined
// deletes that key; anything else is set (coerced to string).
export function updateUrlParams(patch) {
  const params = getUrlParams();
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}
