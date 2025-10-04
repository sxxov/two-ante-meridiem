import { Signal } from './lib-signal.js';

export function watchElementIntersecting(
  /** @type {Element} */ el,
  /** @type {IntersectionObserverInit} */ options = {},
) {
  return new Signal(/** @type {boolean | undefined} */ (undefined), ({
    set,
  }) => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;

      set(entry.isIntersecting);
    }, options);
    io.observe(el);

    return () => {
      io.disconnect();
    };
  }).readonly;
}
