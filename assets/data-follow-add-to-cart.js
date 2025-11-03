import { bin } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { ThemeEvents } from '@theme/events';

export const FollowAddToCartBehavior = behavior(
  'follow-add-to-cart',
  class {
    status = t.string
      .choice('idle')
      .choice('pending')
      .choice('fulfilled')

      .choice('rejected')

      .default('idle');
  },
  (element, { status }, {}) => {
    const _ = bin();
    const controller = new AbortController();
    const { signal } = controller;
    _._ = () => { controller.abort(); };

    element.addEventListener(
      'click',
      () => {
        status.set('pending');
      },
      { signal },
    );
    window.addEventListener(
      ThemeEvents.cartError,
      () => {
        status.set('rejected');
      },
      { signal },
    );
    window.addEventListener(
      ThemeEvents.cartUpdate,
      () => {
        status.set('fulfilled');
      },
      { signal },
    );

    return _;
  },
);

registerGlobalBehaviors(FollowAddToCartBehavior);
