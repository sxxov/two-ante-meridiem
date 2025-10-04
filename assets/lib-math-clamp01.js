import { clamp } from './lib-math-clamp.js';
/** @import {Ranged} from './lib-unit-Ranged.js' */

/** @returns {Ranged<0 | 1>} */
export function clamp01(/** @type {number} */ t) {
  return clamp(t, 0, 1);
}
