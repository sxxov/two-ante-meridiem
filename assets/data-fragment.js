import { bin, Signal, subscribe } from './lib-signal.js';
import {
  attachBehavior,
  behavior,
  registerGlobalBehaviors,
  t,
} from './lib-behavior.js';
import { watchElementIntersecting } from './lib-dom-watchElementIntersecting.js';
import { FragmentContentBehavior } from './data-fragment-content.js';
import { FragmentTriggerBehavior } from './data-fragment-trigger.js';
import { BehaviorPropDeserialization } from './lib-behavior-prop-BehaviorPropDeserialization.js';
/** @import {Values} from './lib-utilities-Values.js' */

export const FragmentBehavior = behavior(
  'fragment',
  class {
    url = t.string;
    selector = t.string;
    loading = t.string.choice('eager').choice('lazy').default('eager');
    status = t.string
      .backing()
      .deserialize(BehaviorPropDeserialization.None)

      .choice('idle')
      .choice('loading')
      .choice('ready')

      .choice('error')

      .default('idle');

    container = new Signal(/** @type {HTMLElement | undefined} */ (undefined));
    version = t.number.backing().default(-1);
  },
  (element, { loading, container, version }, { registerLocalBehaviors }) => {
    registerLocalBehaviors(FragmentContentBehavior, FragmentTriggerBehavior);

    const _ = bin();

    _._ = subscribe({ container }, ({ $container }) => {
      if ($container) return;

      const _ = bin();

      const content = document.createElement('div');
      add: element.append(content);
      remove: _._ = () => { content.remove(); };

      _._ = attachBehavior(content, FragmentContentBehavior, {});

      return _;
    });

    _._ = subscribe({ loading }, ({ $loading }) => {
      const _ = bin();

      switch ($loading) {
        case 'eager':
          version.update((it) => it + 1);
          break;
        case 'lazy': {
          const awake = new Signal(false);
          _._ = subscribe({ awake }, ({ $awake }) => {
            if (!$awake) return;
            version.update((it) => it + 1);
          });

          const intersecting = watchElementIntersecting(element);
          _._ = subscribe({ intersecting }, ({ $intersecting }) => {
            if (!$intersecting) return;
            awake.set(true);
          });

          break;
        }
        default:
      }

      return _;
    });

    return _;
  },
);

queueMicrotask(() => { registerGlobalBehaviors(FragmentBehavior); });
