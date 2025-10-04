export function lerp(
  /** @type {number} */ t,
  /** @type {number} */ a,
  /** @type {number} */ b,
) {
  return a + (b - a) * t;
}
