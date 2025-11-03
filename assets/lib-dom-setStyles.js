import { some } from './lib-type-some.js';
/** @import {CSSProperties} from './lib-dom-CSSProperties.js' */

// eslint-disable-next-line prettier/prettier
/** @template {Partial<CSSProperties & Record<`--${string}`, string>>} const Styles */
export function setStyles(
  /** @type {HTMLElement | SVGElement} */ element,
  /** @type {Styles} */ style,
) {
  for (const [key, value] of Object.entries(style)) {
    if (key.startsWith('--'))
      if (some(value))
        element.style.setProperty(key, /** @type {string} */ (value));
      else element.style.removeProperty(key);
    else element.style[/** @type {any} */ (key)] = /** @type {any} */ (value);
  }
}
