import { bin, derive, Signal, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { watchElementIntersecting } from './lib-dom-watchElementIntersecting.js';
import { some } from './lib-functional-some.js';
import { transformTextContentIntoPerSpans } from './data-text-clip-reveal-transformTextContentIntoPerSpans.js';
import { applyOrderToPerSpans } from './data-text-clip-reveal-applyOrderToPerSpans.js';
/** @import {PerSplitMode} from './data-text-clip-reveal-PerSplitMode.js' */

export const TextClipRevealBehavior = behavior(
  'text-clip-reveal',
  class {
    per = t.string.choice('word').choice('character').default('word');
    perDuration = t.number.default(1000);
    delay = t.number.default(0);
    stagger = t.number.default(50);
    staggerNoise = t.number.default(0);
    maxDuration = t.number.default(2000);

    obscured = t.boolean.transient();
    duration = t.number.transient();
    perDelay = t.number.transient();
  },
  (
    element,
    {
      per,
      perDuration,
      delay,
      stagger,
      staggerNoise,
      maxDuration,
      obscured,
      duration,
      perDelay,
    },
    {},
  ) => {
    if (!(element instanceof HTMLElement)) return;

    const _ = bin();

    const intersecting = watchElementIntersecting(element);
    _._ = subscribe({ intersecting }, ({ $intersecting }) => {
      if (!some($intersecting)) return;
      obscured.set(!$intersecting);
    });

    const perSpans = new Signal(
      /** @type {{ length: number; spans: HTMLSpanElement[] } | undefined} */ (
        undefined
      ),
      ({ set }) =>
        subscribe({ per, staggerNoise }, ({ $per, $staggerNoise }) => {
          const initialInnerHtml = element.innerHTML;

          const { length, spans } = transformTextContentIntoPerSpans(
            element,
            /** @type {PerSplitMode} */ ($per),
          );
          applyOrderToPerSpans(spans, $staggerNoise);
          set({ length, spans });

          return () => {
            element.innerHTML = initialInnerHtml;
          };
        }),
    );

    const staggeredDuration = derive(
      { perDuration, stagger, perSpans },
      ({ $perDuration, $stagger, $perSpans }) =>
        $perDuration + $stagger * ($perSpans?.length ?? 0),
    );
    per.trigger();
    perDuration.trigger();
    delay.trigger();
    duration.in(
      derive({ staggeredDuration, maxDuration }, ({
        $staggeredDuration,
        $maxDuration,
      }) => Math.min($staggeredDuration, $maxDuration)),
    );
    perDelay.in(
      derive({ stagger, duration, perSpans, perDuration }, ({
        $stagger,
        $duration,
        $perSpans,
        $perDuration,
      }) =>
        Math.min(
          $stagger,
          getPerStaggeredDelay(
            $duration ?? 0,
            $perSpans?.length ?? 0,
            $perDuration,
          ),
        )),
    );
  },
);

registerGlobalBehaviors(TextClipRevealBehavior);

function getPerStaggeredDelay(
  /** @type {number} */ totalDuration,
  /** @type {number} */ length,
  /** @type {number} */ perDuration,
) {
  if (length <= 1) return 0;

  return (totalDuration - perDuration) / (length - 1);
}
