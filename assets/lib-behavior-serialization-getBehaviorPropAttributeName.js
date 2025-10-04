export function getBehaviorPropAttributeName(
  /** @type {string} */ behaviorName,
  /** @type {string} */ propName,
) {
  return `data-${`${behaviorName}${propName ? `-${propName}` : ''}`.replace(
    /([A-Z])/g,
    (_, c) => `-${c.toLowerCase()}`,
  )}`;
}
