export function getLeadingUnslashed(/** @type {string} */ url) {
  return url.startsWith('/') ? url.slice(1) : url;
}
