export function getBehaviorAttributeName(/** @type {string} */ name) {
  return `data-${name.replace(/([A-Z])/g, (_, c) => `-${c.toLowerCase()}`)}`;
}
