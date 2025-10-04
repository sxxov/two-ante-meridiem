import { mod } from './lib-math-mod.js';

/**
 * Returns the cyclical side of {@linkcode a} relative to {@linkcode b}, assuming
 * they are within {@linkcode range}, represented by its sign
 */
export function cyclicalSide(
  /** @type {number} */ a,
  /** @type {number} */ b,
  /** @type {number} */ range,
) {
  // normalize x and n within the sequence
  const normalizedX = mod(a, range);
  const normalizedN = mod(b, range);

  // calculate the difference in the circular sequence
  const diff = (normalizedX - normalizedN + range) % range;

  // determine the side
  if (diff === 0) {
    return 0;
  }

  if (diff < range / 2) {
    return 1;
  }

  return -1;
}
