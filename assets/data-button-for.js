import { bin } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { querySelectorAllLax } from './lib-dom-querySelectorAllLax.js';

export const ButtonForBehavior = behavior(
  'button-for',
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
          if (target instanceof HTMLElement) target.click();
      },
      { signal },
    );

    return _;
  },
);

registerGlobalBehaviors(ButtonForBehavior);
