import { bin, subscribe } from './lib-signal.js';
import { behavior, t } from './lib-behavior.js';
import { ProductPullBehavior } from './data-product-pull.js';
import { getBehaviorAttributeName } from './lib-behavior-serialization-getBehaviorAttributeName.js';

export const ProductPullNodeBehavior = behavior(
  'product-pull-node',
  class {
    '' = t.string;
  },
  (element, { '': id }, { getContext }) =>
    subscribe({ productPull: getContext(ProductPullBehavior) }, ({
      $productPull,
    }) => {
      if (!$productPull) return;

      const _ = bin();

      const { nodes } = $productPull;
      const attributeName = getBehaviorAttributeName(
        ProductPullNodeBehavior.name,
      );
      const selector = id.derive((it) => `[${attributeName}=${it}]`);
      _._ = subscribe({ selector }, ({ $selector }) => {
        nodes.update((it) => {
          it.set(element, { selector: $selector });
          nodes.trigger();
          return it;
        });
        return () => {
          nodes.update((it) => {
            it.delete(element);
            nodes.trigger();
            return it;
          });
        };
      });

      return _;
    }),
);
