/** @import {Invalidator} from './lib-signal.js' */

export function subscribeFrame(
  /** @type {(deltaTime: number) => Invalidator | void | Promise<void>} */ callback,
) {
  /** @type {Invalidator | undefined} */
  let invalidator;
  const invokeCallback = (/** @type {number} */ deltaTime) => {
    const invalidatorOrVoid = callback(deltaTime);
    if (typeof invalidatorOrVoid === 'function')
      invalidator = invalidatorOrVoid;
  };

  let previousTime = performance.now();
  let rafHandle = requestAnimationFrame(function loop(time) {
    rafHandle = requestAnimationFrame(loop);
    const deltaTime = time - previousTime;
    previousTime = time;

    void invalidator?.();
    invokeCallback(deltaTime);
  });

  return () => {
    cancelAnimationFrame(rafHandle);
    void invalidator?.();
  };
}
