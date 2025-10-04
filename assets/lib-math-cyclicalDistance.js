/**
 * Returns the shortest cyclical distance between {@linkcode a} & {@linkcode b},
 * assuming they are both within {@linkcode range}
 */
export function cyclicalDistance(
  /** @type {number} */ a,
  /** @type {number} */ b,
  /** @type {number} */ range,
) {
  a %= range;
  b %= range;

  // calculate forward and backward distances
  const forwardDistance = (b - a + range) % range;
  const backwardDistance = (a - b + range) % range;

  // return the minimum of the two distances
  return Math.min(forwardDistance, backwardDistance);
}
