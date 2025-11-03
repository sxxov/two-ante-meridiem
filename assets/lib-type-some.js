/**
 * @template T
 * @returns {value is T}
 */
export function some(/** @type {T | undefined | null} */ value) {
  return value !== undefined && value !== null;
}
