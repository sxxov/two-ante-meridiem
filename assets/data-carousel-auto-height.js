import { CarouselBehavior } from './data-carousel.js';
import { behavior } from './lib-behavior.js';
import { omitNullish } from './lib-object-omitNullish.js';
import { bin, derive, subscribe } from './lib-signal.js';

export const CarouselAutoHeightBehavior = behavior(
  'carousel-auto-height',
  class {},
  (element, { ...options }, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, async ({
      $carousel,
    }) => {
      if (!$carousel) return;

      const { plugins } = $carousel;
      const _ = bin();
      const { default: EmblaCarouselAutoHeight } = await import(
        './lib-package-embla-carousel-auto-height.js'
      );
      _._ = subscribe({ options: derive(options) }, ({ $options }) => {
        plugins.update((it) => {
          it.add(EmblaCarouselAutoHeight(omitNullish($options)));
          plugins.trigger();
          return it;
        });
      });

      return _;
    }),
);
