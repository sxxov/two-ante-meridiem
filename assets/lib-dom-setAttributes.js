import { setStyles } from './lib-dom-setStyles.js';
/** @import {CSSProperties} from './lib-dom-CSSProperties.js' */

/* eslint-disable prettier/prettier */
/**
 * @template {Element} Element
 * @template {Partial<
 * 	Omit<Element, 'style'> & {
 * 		style?: Partial<CSSProperties & Record<`--${string}`, string>>;
 * 	} & Record<
 * 			`data-${string}` | `aria-${string}`,
 * 			string | number | boolean | null | undefined
 * 		> &
 * 		Record<string, unknown>
 * >} const Attributes
 */
/* eslint-enable */
export function setAttributes(
  /** @type {Element} */ element,
  /** @type {Attributes} */ attributes,
) {
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'style' && 'style' in element) {
      setStyles(
        /** @type {any} */ (element),
        /** @type {Parameters<typeof setStyles>[1]} */ (value),
      );
      continue;
    }

    if (key in element)
      try {
        element[/** @type {keyof typeof element} */ (key)] =
          /** @type {any} */ (value);
        continue;
      } catch {}

    if (value === undefined || value === null || value === false) {
      element.removeAttribute(key);
      continue;
    }

    if (value === true) {
      element.setAttribute(key, '');
      continue;
    }

    if (typeof value === 'number') {
      element.setAttribute(key, `${value}`);
      continue;
    }

    if (typeof value === 'string') {
      element.setAttribute(key, value);
      continue;
    }
  }
}
