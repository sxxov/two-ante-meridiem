import { lerp } from './lib-math-lerp.js';
import { map01 } from './lib-math-map01.js';

/**
 * Maps {@linkcode t} from the range {@linkcode rangeStart} to {@linkcode rangeEnd}
 * to the range {@linkcode domainStart} to {@linkcode domainEnd}, without clamping
 * it.
 *
 * @example
 *   ```ts
 *   	map01(50, 0, 100, 0, 1); // 0.5
 *   	map01(200, 0, 100, 0, 10); // 20
 *   	map01(-50, 0, 100, 0, 10); // -5
 *   ```;
 */

export function map(
  /** @type {number} */ t,
  /** @type {number} */ rangeStart,
  /** @type {number} */ rangeEnd,
  /** @type {number} */ domainStart,
  /** @type {number} */ domainEnd,
) {
  return lerp(map01(t, rangeStart, rangeEnd), domainStart, domainEnd);
}
