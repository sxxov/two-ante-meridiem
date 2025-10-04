/** @import {Ranged} from './lib-unit-Ranged.js' */

/**
 * @template {number} const Min
 * @template {number} const Max
 * @returns {Ranged<Min | Max>}
 */
export function clamp(
  /** @type {number} */ t,
  /** @type {Min} */ min,
  /** @type {Max} */ max,
) {
  return Math.min(Math.max(t, min), max);
}
