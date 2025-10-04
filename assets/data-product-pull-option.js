import { bin, Signal, subscribe } from './lib-signal.js';
import { behavior, t } from './lib-behavior.js';
import { ProductPullBehavior } from './data-product-pull.js';
import { some } from './lib-functional-some.js';

export const ProductPullOptionBehavior = behavior(
  'product-pull-option',
  class {
    name = t.string;
    value = t.string;
  },
  (element, { name, value }, { getContext }) =>
    subscribe({ productPull: getContext(ProductPullBehavior) }, ({
      $productPull,
    }) => {
      if (!$productPull) return;

      const _ = bin();
      const { parameters } = $productPull;
      const controller = new AbortController();
      const { signal } = controller;
      _._ = () => { controller.abort(); };

      const key = new Signal({});
      element.addEventListener(
        'change',
        () => {
          key.set({});
        },
        { signal },
      );

      _._ = subscribe({ name, value, '': key }, ({ $name, $value }) => {
        if (!some($value) || !some($name)) return;

        /** @type {string | undefined} */
        let previousValue;
        parameters.update((it) => {
          const currentVariant = it.get($name) ?? undefined;
          previousValue = currentVariant;
          it.set($name, $value);
          parameters.trigger();
          return it;
        });
        return () => {
          parameters.update((it) => {
            const currentValue = it.get($name) ?? undefined;
            if (currentValue !== $value) return it;

            if (some(previousValue)) {
              it.set($name, previousValue);
              previousValue = undefined;
            } else {
              it.delete($name);
            }

            parameters.trigger();
            return it;
          });
        };
      });

      return _;
    }),
);
