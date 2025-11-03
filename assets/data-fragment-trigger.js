import { bin, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';

export const FragmentTriggerBehavior = behavior(
  'fragment-trigger',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ fragment: getContext(FragmentBehavior) }, ({ $fragment }) => {
      if (!$fragment) return;

      const { version } = $fragment;

      const _ = bin();
      const controller = new AbortController();
      const { signal } = controller;
      _._ = () => { controller.abort(); };

      element.addEventListener(
        'click',
        () => {
          version.update((it) => it + 1);
        },
        { signal },
      );
    }),
);
