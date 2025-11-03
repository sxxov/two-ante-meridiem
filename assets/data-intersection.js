import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { bin, derive, Signal } from './lib-signal.js';

export const IntersectionBehavior = behavior(
  'intersection',
  class {
    threshold = t.number.default(0);
    intersection = new Signal(
      /** @type {{ visible: boolean; ratio: number } | undefined} */ (
        undefined
      ),
    );
    visible = t.boolean
      .backing()
      .in(
        derive(
          { intersection: this.intersection, threshold: this.threshold },
          ({ $intersection, $threshold }) =>
            $intersection?.visible && $intersection.ratio >= $threshold,
        ),
      );
  },
  (element, { intersection }, {}) => {
    const _ = bin();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        intersection.set({
          visible: entry.isIntersecting,
          ratio: entry.intersectionRatio,
        });
      },
      {
        threshold: Array.from({ length: 100 }, (_, i) => i / 100),
      },
    );
    observer.observe(element);
    _._ = () => { observer.disconnect(); };

    return _;
  },
);

registerGlobalBehaviors(IntersectionBehavior);
