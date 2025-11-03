import { bin, derive, subscribe } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior } from './lib-behavior.js';
import { omitNullish } from './lib-object-omitNullish.js';

export const CarouselHashBehavior = behavior(
  'carousel-hash',
  class {},
  (element, { ...options }, { getContext }) =>
    subscribe(
      { carousel: getContext(CarouselBehavior) },
      async ({ $carousel }) => {
        if (!$carousel) return;

        const { plugins } = $carousel;

        const _ = bin();
        const { default: EmblaCarouselHash } = await import(
          './data-carousel-hash-embla-carousel-hash-plugin.js'
        );
        _._ = subscribe({ options: derive(options) }, ({ $options }) => {
          plugins.update((it) => {
            it.add(EmblaCarouselHash(omitNullish($options)));
            plugins.trigger();
            return it;
          });
        });

        return _;
      },
    ),
);
