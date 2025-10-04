import { behavior, registerGlobalBehaviors } from './lib-behavior.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { setStyles } from './lib-dom-setStyles.js';

export const IndicesBehavior = behavior(
  'indices',
  class {
    //
  },
  (element, {}, {}) => {
    if (!(element instanceof HTMLElement)) return;

    let i = 0;
    for (const child of generateIndexChildren(element)) {
      setStyles(child, {
        '--index': `${i}`,
      });
      setAttributes(child, {
        'data-indices-index': `${i}`,
      });
      i++;
    }
    setStyles(element, {
      '--length': `${i}`,
    });
  },
);

registerGlobalBehaviors(IndicesBehavior);

/** @returns {IterableIterator<HTMLElement>} */
function* generateIndexChildren(/** @type {HTMLElement} */ el) {
  if (!(el instanceof HTMLElement)) return;

  const { children } = el;
  if (children.length <= 0) return;

  for (const child of children) {
    if (!(child instanceof HTMLElement)) continue;

    const { display } = getComputedStyle(child);
    if (display === 'none') continue;
    if (display === 'contents') {
      yield* generateIndexChildren(child);
      continue;
    }

    yield child;
  }
}
