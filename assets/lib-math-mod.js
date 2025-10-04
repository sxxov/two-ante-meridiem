/**
 * An actual modulo function that works on both positive & negative numbers,
 * instead of the `%` remainder operator included in JS
 */
export function mod(/** @type {number} */ t, /** @type {number} */ m) {
  return ((t % m) + m) % m;
}
