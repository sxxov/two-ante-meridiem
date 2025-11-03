import { subscribe, bin, derive } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior, t } from './lib-behavior.js';
import { clamp01 } from './lib-math-clamp01.js';
import { cyclicalDistance } from './lib-math-cyclicalDistance.js';
import { cyclicalSide } from './lib-math-cyclicalSide.js';
import { map01 } from './lib-math-map01.js';
import { distance } from './lib-math-distance.js';
import { BehaviorPropSerialization } from './lib-behavior-prop-BehaviorPropSerialization.js';

export const CarouselItemBehavior = behavior(
  'carousel-item',
  class {
    index = t.number
      .backing()
      .serialize(
        BehaviorPropSerialization.Attribute | BehaviorPropSerialization.Style,
      );
    selected = t.boolean.backing();
    push = t.number.backing().serialize(BehaviorPropSerialization.Style);
    sign = t.number.backing().serialize(BehaviorPropSerialization.Style);
    progress = t.number.backing().serialize(BehaviorPropSerialization.Style);
  },
  (element, { selected, index, push, sign, progress }, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, ({ $carousel }) => {
      if (!$carousel) return;

      const { carousel, selectedIndex, scroll, length, loop } = $carousel;
      const _ = bin();

      _._ = subscribe({ carousel }, ({ $carousel }) => {
        if (!$carousel) return;

        const indexOfElement = $carousel.slideNodes().indexOf(element);
        if (indexOfElement < 0) return;

        index.set(indexOfElement);
      });

      selected.in(
        derive(
          { selectedIndex, index },
          ({ $selectedIndex, $index }) => $selectedIndex === $index,
        ),
      );

      _._ = subscribe(
        { scroll, length, loop, index },
        ({ $scroll, $length, $loop, $index = 0 }) => {
          const progressValue =
            $index === 0 ?
              1 +
              clamp01(map01($scroll, $length - 1, $length)) -
              clamp01(map01($scroll, 0, 1))
            : clamp01(map01($scroll, $index - 1, $index)) -
              clamp01(map01($scroll, $index, $index + 1));
          /** @type {number} */
          let pushValue;
          /** @type {number} */
          let signValue;

          if ($loop) {
            const distanceFromItem = cyclicalDistance($scroll, $index, $length);
            const side = -cyclicalSide($scroll, $index, $length);
            pushValue = (1 - distanceFromItem / $length - progressValue) * side;
            signValue = (distanceFromItem / $length) * side;
          } else {
            const distanceFromItem = distance($scroll, $index);
            const side = $scroll < $index ? 1 : -1;
            pushValue = (1 - distanceFromItem / $length - progressValue) * side;
            signValue = (distanceFromItem / $length) * side;
          }

          push.set(pushValue);
          sign.set(signValue);
          progress.set(progressValue);
        },
      );

      return _;
    }),
);
