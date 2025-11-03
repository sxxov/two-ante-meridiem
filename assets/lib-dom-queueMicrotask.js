/**
 * Queues a "micro" task, equivalent to {@linkcode queueMicrotask}
 *
 * **Note:** This differs from {@linkcode queueMicrotask} in that it uses a
 * {@linkcode Promise} instead, as browsers have a better time preserving stack
 * traces with it. This function also returns an unsubscribe function for
 * convenience
 */
export function queueMicrotask(/** @type {() => void} */ callback) {
  let cancelled = false;
  void Promise.resolve().then(() => {
    if (cancelled) return;
    callback();
  });

  return () => {
    cancelled = true;
  };
}
