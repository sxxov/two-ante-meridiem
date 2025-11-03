/** @import {Values} from './lib-utilities-Values.js' */

export const BehaviorPropSerialization = /** @type {const} */ ({
  None: 0b0000,
  Attribute: 0b0001,
  Style: 0b0010,
});
/** @typedef {Values<typeof BehaviorPropSerialization> | (number & {})} BehaviorPropSerialization */
