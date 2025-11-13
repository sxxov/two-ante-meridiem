import { subscribe, bin, derive } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior, t } from './lib-behavior.js';
import { some } from './lib-type-some.js';
import { BehaviorPropDeserialization } from './lib-behavior-prop-BehaviorPropDeserialization.js';

export const CarouselPrevBehavior = behavior(
  'carousel-prev',
  class {
    disabled = t.boolean
      .backing()
      .deserialize(BehaviorPropDeserialization.None);
    loop = t.boolean.default(false);
    looping = t.boolean.backing();
  },
  (element, { disabled, looping, loop }, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, ({ $carousel }) => {
      if (!$carousel) return;

      const { carousel, targetSelectedIndex, selectedIndex, length } =
        $carousel;
      const _ = bin();

      _._ = subscribe(
        { carousel, loop, length },
        ({ $carousel, $loop, $length }) => {
          if (!$carousel) return;

          const controller = new AbortController();
          const { signal } = controller;

          element.addEventListener(
            'click',
            () => {
              if ($carousel.canScrollPrev())
                targetSelectedIndex.update((v) => v - 1);
              else if ($loop) targetSelectedIndex.set($length - 1);
            },
            { signal },
          );

          return () => {
            controller.abort();
          };
        },
      );

      disabled.in(
        derive(
          {
            loop,
            carousel,
          },
          ({ $loop, $carousel }) => {
            if (!$carousel) return true;
            return !$loop && !$carousel.canScrollPrev();
          },
        ),
      );
      _._ = subscribe({ disabled }, ({ $disabled }) => {
        if (element instanceof HTMLButtonElement && some($disabled))
          element.disabled = $disabled;
      });

      looping.in(
        derive(
          {
            loop,
            selectedIndex,
            carousel,
          },
          ({ $loop, $selectedIndex }) => $loop && $selectedIndex <= 0,
        ),
      );

      return _;
    }),
);
