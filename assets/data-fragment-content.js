import { bin, subscribe } from './lib-signal.js';
import { attachBehavior, behavior } from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';
import { FragmentPortalBehavior } from './data-fragment-portal.js';

export const FragmentContentBehavior = behavior(
  'fragment-content',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ fragment: getContext(FragmentBehavior) }, ({ $fragment }) => {
      if (!$fragment) return;

      const { container } = $fragment;

      const _ = bin();

      add: {
        const $container = container.get();
        if (!$container?.contains(element)) container.set(element);
      }
      remove: _._ = () => {
        const $container = container.get();
        if ($container === element) container.set(undefined);
      };

      _._ = attachBehavior(element, FragmentPortalBehavior, {});

      return _;
    }),
);
