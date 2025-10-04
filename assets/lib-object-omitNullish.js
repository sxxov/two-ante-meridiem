import { some } from './lib-functional-some.js';
/** @import {PartialNullable} from "./lib-object-PartialNullable.js"; */

/** @template {Record<string, any>} T */
export function omitNullish(/** @type {T} */ obj) {
  return /** @type {PartialNullable<T>} */ (
    Object.fromEntries(Object.entries(obj).filter(([, value]) => some(value)))
  );
}
