import { bin, subscribe } from './lib-signal.js';
import { behavior, t } from './lib-behavior.js';
import { PullBehavior } from './data-pull.js';
import { getBehaviorAttributeName } from './lib-behavior-serialization-getBehaviorAttributeName.js';

export const PullTargetBehavior = behavior(
  'pull-target',
  class {
    '' = t.string;
  },
  (element, { '': id }, { getContext }) =>
    subscribe({ pull: getContext(PullBehavior) }, ({ $pull }) => {
      if (!$pull) return;

      const _ = bin();

      const { nodes } = $pull;
      const attributeName = getBehaviorAttributeName(PullTargetBehavior.name);
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
