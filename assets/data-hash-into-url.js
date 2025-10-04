import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { watchElementRect } from './lib-dom-watchElementRect.js';
import { some } from './lib-functional-some.js';
import { unset } from './lib-functional-unset.js';
import { scrollY } from './lib-human-scroll.js';
import { clamp01 } from './lib-math-clamp01.js';
import { map01 } from './lib-math-map01.js';
import { bin, Signal, subscribe } from './lib-signal.js';
import { viewportSize } from './lib-viewport-viewportSize.js';

const candidates = new Signal(
  new /** @type {typeof Map<HTMLElement, { y: number; progress: number }>} */ (
    Map
  )(),
);
const activeCandidate = candidates.derive(
  (it) =>
    [...it.entries()].sort(
      ([, a], [, b]) => b.progress - a.progress || a.y - b.y,
    )[0]?.[0],
);

export const HashIntoUrlBehavior = behavior(
  'hash-into-url',
  class {
    active = t.boolean.transient();
    current = t.boolean.transient();
  },
  (element, { active, current }, {}) => {
    const { id } = element;
    if (!id) return;

    const _ = bin();

    let previousHash = unset(String);
    const rect = watchElementRect(element);

    _._ = subscribe({ rect, scrollY, viewportSize }, ({
      $rect: { y: $y, height: $height },
      $scrollY,
      $viewportSize: { height: $vh },
    }) => {
      if (!some($y) || !some($height)) return;

      current.set($scrollY <= $y + $height - 1 && $scrollY + $vh - 1 >= $y);
    });

    _._ = subscribe({ rect, current, viewportSize, scrollY }, ({
      $rect: { y: $y, height: $height },
      $current,
      $viewportSize: { height: $vh },
      $scrollY,
    }) => {
      if (!some($y) || !some($height)) return;

      if (!$current) return;

      candidates.update((it) => {
        const progress =
          clamp01(map01($scrollY, $y - $vh, $y - $vh + $height)) -
          clamp01(map01($scrollY, $y, $y + $height));
        element.style.setProperty('--progress', String(progress));
        it.set(element, {
          y: $y,
          progress,
        });
        candidates.trigger();
        return it;
      });
    });
    _._ = () => {
      candidates.update((it) => {
        it.delete(element);
        candidates.trigger();
        return it;
      });
    };

    _._ = subscribe({ activeCandidate }, ({ $activeCandidate }) => {
      active.set($activeCandidate === element);
    });

    _._ = subscribe({ active }, ({ $active }) => {
      if ($active) {
        previousHash = location.hash;
        history.replaceState(undefined, '', `#${id}`);
      } else if (location.hash === `#${id}`)
        history.replaceState(undefined, '', previousHash ?? '');
    });

    return _;
  },
);

registerGlobalBehaviors(HashIntoUrlBehavior);
