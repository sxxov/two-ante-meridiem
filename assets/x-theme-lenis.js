/* eslint-disable @typescript-eslint/unbound-method */
import { some } from './lib-functional-some.js';
import Lenis from './lib-package-lenis.js';
/** @import {ScrollCallback} from 'lenis' */

export const lenis = new Lenis({
  prevent: (el) => {
    const isInMarkupIoOutside = some(
      document.querySelector('.app-mount .project-container .thread-list'),
    );
    if (isInMarkupIoOutside) return true;

    const isPreventedViaStyles =
      getComputedStyle(el).getPropertyValue('--lenis') === 'prevent';
    if (isPreventedViaStyles) return true;

    return false;
  },
});

let lenisScrolling = false;
requestAnimationFrame(function lenisRaf(t) {
  requestAnimationFrame(lenisRaf);
  lenisScrolling = true;
  lenis.raf(t);
  lenisScrolling = false;
});

const { scrollIntoView } = HTMLElement.prototype;
/** @this {HTMLElement} */
function scrollIntoViewUsingLenis(
  /** @type {ScrollIntoViewOptions} */ options,
) {
  if (typeof options === 'object') {
    const { behavior } = options;
    if (behavior === 'smooth') {
      const { scrollMarginTop: scrollMarginTopRaw } = getComputedStyle(this);
      const scrollMarginTop = Number(scrollMarginTopRaw.replace('px', ''));
      lenis.velocity = 0;
      lenis.scrollTo(this, {
        ...(!Number.isNaN(scrollMarginTop) && {
          offset: -scrollMarginTop,
        }),
      });

      return;
    }
  }

  scrollIntoView.call(this, options);
}
HTMLElement.prototype.scrollIntoView = scrollIntoViewUsingLenis;

const { scrollTo } = window;
/**
 * @overload
 * @returns {void}
 * @this {Window}
 */
/**
 * @overload
 * @param {ScrollToOptions} options
 * @returns {void}
 * @this {Window}
 */
/**
 * @overload
 * @param {number} x
 * @param {number} y
 * @returns {void}
 * @this {Window}
 */
function scrollToUsingLenis(
  /** @type {[number | ScrollToOptions | undefined, number | undefined]} */ ...args
) {
  const objectArg = args[0] && typeof args[0] === 'object' ?
    /** @type {ScrollToOptions} */ (args[0])
  : undefined;
  const top = objectArg?.top ?? args[1];
  const behavior = objectArg?.behavior;

  if (top !== undefined && !lenisScrolling && !objectArg?.bypass) {
    lenis.velocity = 0;
    lenis.scrollTo(top, {
      immediate: behavior !== 'smooth',
      programmatic: true,
    });
  }

  scrollTo.call(this, .../** @type {[number, number]} */ (args));
}
window.scrollTo = scrollToUsingLenis;
