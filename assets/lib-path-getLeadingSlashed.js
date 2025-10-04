export function getLeadingSlashed(/** @type {string} */ url) {
  return url.startsWith('/') || url.startsWith('http') ? url : `/${url}`;
}
