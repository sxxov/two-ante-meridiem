export function getTrailingUnslashed(/** @type {string} */ url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
