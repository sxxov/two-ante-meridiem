/**
 * A utility function that always returns `undefined`, useful for declaring
 * uninitialized variables
 *
 * @template [R=undefined] Default is `undefined`
 * @returns {R | undefined}
 */
export function unset(
  /** @type {(() => R) | undefined} */ factory = undefined,
) {
  return undefined;
}
