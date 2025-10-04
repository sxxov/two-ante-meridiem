import { scrollX, scrollY } from './lib-human-scroll.js';
import { derive, Signal, subscribe } from './lib-signal.js';
import { largeViewportSize } from './lib-viewport-viewportSize.js';
import { getElementDocumentOffset } from './lib-dom-getElementDocumentOffset.js';
import { watchElementSize } from './lib-dom-watchElementSize.js';
import { watchElementIntersecting } from './lib-dom-watchElementIntersecting.js';
/** @import {Point} from './lib-unit-Point.js' */

export function watchElementRect(/** @type {HTMLElement} */ el) {
  const size = watchElementSize(el);
  const intersecting = watchElementIntersecting(el);
  const offset = new Signal(
    /** @type {Point<number | undefined>} */ ({
      x: undefined,
      y: undefined,
    }),
  );
  const rect = derive({ size, offset }, ({ $size, $offset }) => ({
    ...$size,
    ...$offset,
  }));

  const update = () => {
    offset.update(($offset) => {
      const { x, y } = getElementDocumentOffset(el);
      return coerceOffsetIdentityChange($offset, { x, y });
    });
  };
  const hasOffsetHydrated = () => {
    const $offset = offset.get();
    return $offset.x !== undefined && $offset.y !== undefined;
  };
  const scheduleUpdateOnNextTick = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });
  };

  let scheduledUpdateOnNextScroll = false;
  const scheduleUpdateOnNextScroll = () => {
    scheduledUpdateOnNextScroll = true;
  };
  rect.subscribeStart(() =>
    subscribe({ scrollX, scrollY }, ({}) => {
      if (!scheduledUpdateOnNextScroll) return;

      update();
      scheduledUpdateOnNextScroll = false;
    }));

  rect.subscribeStart(() =>
    subscribe({ largeViewportSize }, ({}) => {
      update();
      scheduleUpdateOnNextTick();
      scheduleUpdateOnNextScroll();
    }));
  rect.subscribeStart(() =>
    subscribe({ size }, ({}) => {
      if (!hasOffsetHydrated()) update();
      scheduleUpdateOnNextScroll();
    }));
  rect.subscribeStart(() =>
    subscribe({ intersecting }, ({ $intersecting }) => {
      if (!hasOffsetHydrated() || $intersecting) update();
    }));

  return rect.readonly;
}

function coerceOffsetIdentityChange(
  /** @type {Point<number | undefined>} */ source,
  /** @type {Point<number | undefined>} */ uniqueOrSame,
) {
  if (source.x === uniqueOrSame.x && source.y === uniqueOrSame.y) return source;
  return uniqueOrSame;
}
