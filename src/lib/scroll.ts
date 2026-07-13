/**
 * Smooth-scroll to an in-page anchor without leaving `#id` in the URL.
 * Used by landing-page nav so shareable links stay clean.
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // strip any existing hash so the address bar stays clean
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}
