import { Signal } from './lib-signal.js';
/** @import {Size} from './lib-unit-Size.js' */

export function watchElementSize(
  /** @type {Element} */ el,
  /** @type {ResizeObserverOptions} */ options = {},
) {
  return new Signal(
    /** @type {Size<number | undefined>} */ ({
      width: undefined,
      height: undefined,
    }),
    ({ set }) => {
      const ro = new ResizeObserver(([entry]) => {
        if (!entry) return;

        const {
          borderBoxSize: [borderBoxSize],
          contentRect,
        } = entry;
        set({
          width: borderBoxSize?.inlineSize ?? contentRect.width,
          height: borderBoxSize?.blockSize ?? contentRect.height,
        });
      });
      ro.observe(el, options);

      return () => {
        ro.disconnect();
      };
    },
  ).readonly;
}
