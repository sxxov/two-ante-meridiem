export function getTrailingSlashed(/** @type {string} */ url) {
  return url.endsWith('/') ? url : `${url}/`;
}
