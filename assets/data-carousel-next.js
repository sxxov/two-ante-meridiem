import { subscribe, bin, derive } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior, t } from './lib-behavior.js';
import { some } from './lib-type-some.js';

export const CarouselNextBehavior = behavior(
  'carousel-next',
  class {
    disabled = t.boolean.backing();
    loop = t.boolean.default(false);
    looping = t.boolean.backing();
  },
  (element, { disabled, looping, loop }, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, ({ $carousel }) => {
      if (!$carousel) return;

      const { carousel, targetSelectedIndex, selectedIndex } = $carousel;
      const _ = bin();

      _._ = subscribe({ carousel, loop }, ({ $carousel, $loop }) => {
        if (!$carousel) return;

        const controller = new AbortController();
        const { signal } = controller;

        element.addEventListener(
          'click',
          () => {
            if ($carousel.canScrollNext())
              targetSelectedIndex.update((it) => it + 1);
            else if ($loop) targetSelectedIndex.set(0);
          },
          { signal },
        );

        return () => {
          controller.abort();
        };
      });

      disabled.in(
        derive(
          {
            loop,
            carousel,
          },
          ({ $loop, $carousel }) => {
            if (!$carousel) return true;
            return !$loop && !$carousel.canScrollNext();
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
          ({ $loop, $selectedIndex, $carousel }) =>
            $loop &&
            $selectedIndex >= ($carousel?.scrollSnapList().length ?? 0) - 1,
        ),
      );

      return _;
    }),
);
