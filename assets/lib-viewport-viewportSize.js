import { Signal } from './lib-signal.js';
/** @import {Size} from './lib-unit-Size.js' */

/** @type {Size} */
const initialSize = {
  width: window.innerHeight,
  height: window.innerWidth,
};

export const largeViewportSize = new Signal(initialSize, ({ set }) => {
  const ro = new ResizeObserver(([entry]) => {
    if (!entry) return;

    set({
      height: entry.contentRect.height,
      width: entry.contentRect.width,
    });
  });
  ro.observe(document.body.appendChild(createMeasurer('lv')));

  return () => {
    ro.disconnect();
  };
}).readonly;
export const smallViewportSize = new Signal(initialSize, ({ set }) => {
  const ro = new ResizeObserver(([entry]) => {
    if (!entry) return;

    set({
      height: entry.contentRect.height,
      width: entry.contentRect.width,
    });
  });
  ro.observe(document.body.appendChild(createMeasurer('sv')));

  return () => {
    ro.disconnect();
  };
}).readonly;
export const viewportSize = largeViewportSize;

function createMeasurer(/** @type {'lv' | 'sv'} */ measurement) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    visibility: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    width: `100${measurement}w`,
    height: `100${measurement}h`,
    pointerEvents: 'none',
    zIndex: -1,
  });

  return div;
}
