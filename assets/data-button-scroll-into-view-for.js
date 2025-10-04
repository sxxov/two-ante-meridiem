import { bin } from './lib-signal.js';
import { behavior, t } from './lib-behavior.js';
import { querySelectorAllLax } from './lib-dom-querySelectorAllLax.js';

export const ButtonScrollIntoViewForBehavior = behavior(
  'button-scroll-into-view-for',
  class {
    '' = t.string;
    targets = this[''].derive(querySelectorAllLax);
  },
  (element, { targets }, {}) => {
    const _ = bin();

    const controller = new AbortController();
    const { signal } = controller;
    _._ = () => { controller.abort(); };

    element.addEventListener(
      'click',
      () => {
        const $targets = targets.get();
        for (const target of $targets)
          if (target instanceof Element)
            target.scrollIntoView({ behavior: 'smooth' });
      },
      { signal },
    );

    return _;
  },
);
