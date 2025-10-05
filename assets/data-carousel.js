import { Signal, subscribe, bin, derive } from './lib-signal.js';
import {
  behavior,
  t,
  hasAttachedBehavior,
  attachBehavior,
  registerGlobalBehaviors,
} from './lib-behavior.js';
import { subscribeSelectorAll } from './lib-dom-subscribeSelectorAll.js';
import { omitNullish } from './lib-object-omitNullish.js';
import { CarouselContentBehavior } from './data-carousel-content.js';
import { CarouselItemBehavior } from './data-carousel-item.js';
import { CarouselIndicatorBehavior } from './data-carousel-indicator.js';
import { CarouselPrevBehavior } from './data-carousel-prev.js';
import { CarouselNextBehavior } from './data-carousel-next.js';
import EmblaCarousel from './lib-package-embla-carousel.js';
import { TaskSignal } from './lib-signal-TaskSignal.js';
import { CarouselHashBehavior } from './data-carousel-hash.js';
import { CarouselAutoHeightBehavior } from './data-carousel-auto-height.js';
/** @import {EmblaCarouselType, EmblaPluginType} from 'embla-carousel' */

export const CarouselBehavior = behavior(
  'carousel',
  class {
    active = t.boolean;
    align = t.string.choice('start').choice('center').choice('end');
    axis = t.string.choice('x').choice('y');
    containScroll = t.string.choice('trimSnaps').choice('keepSnaps');
    direction = t.string.choice('ltr').choice('rtl');
    dragFree = t.boolean;
    dragThreshold = t.number;
    duration = t.number;
    inViewThreshold = t.number;
    loop = t.boolean;
    skipSnaps = t.boolean;
    slidesToScroll = t.number;
    startIndex = t.number;

    plugins = new TaskSignal(/** @type {Set<EmblaPluginType>} */ (new Set()));
    contentContainer = new Signal(
      /** @type {HTMLElement | undefined} */ (undefined),
    );

    carousel = new Signal(
      /** @type {EmblaCarouselType | undefined} */ (undefined),
    );
    selectedIndex = t.number
      .default(0)
      .transient()
      .in(
        new Signal(0, ({ set }) =>
          subscribe({ carousel: this.carousel }, ({ $carousel }) => {
            if (!$carousel) return;
            const updateSelectedIndex = () => {
              set($carousel.selectedScrollSnap());
            };
            $carousel.on('init', updateSelectedIndex);
            $carousel.on('select', updateSelectedIndex);
            return () => {
              $carousel.off('init', updateSelectedIndex);
              $carousel.off('select', updateSelectedIndex);
            };
          })).in(this.startIndex.derive((it) => it ?? 0)),
      ).readonly;
    targetSelectedIndex = new Signal(this.selectedIndex.get(), ({
      subscribe,
    }) => {
      const _ = bin();
      _._ = subscribe((it) => {
        if (it) this.carousel.get()?.scrollTo(it);
      });
      return _;
    }).in(this.selectedIndex);
    scroll = t.number
      .transient()
      .default(0)
      .in(
        new Signal(0, ({ set }) =>
          subscribe({ carousel: this.carousel, loop: this.loop }, ({
            $carousel,
            $loop,
          }) => {
            if (!$carousel) return;

            const updateScroll = () => {
              set(
                $carousel.scrollProgress() *
                  ($carousel.scrollSnapList().length - 1 + ($loop ? 1 : 0)),
              );
            };
            $carousel.on('init', updateScroll);
            $carousel.on('scroll', updateScroll);
            return () => {
              $carousel.off('init', updateScroll);
              $carousel.off('scroll', updateScroll);
            };
          })),
      ).readonly;
    length = t.number
      .transient()
      .default(0)
      .in(
        new Signal(0, ({ set }) =>
          subscribe({ carousel: this.carousel }, ({ $carousel }) => {
            if (!$carousel) return;

            const updateLength = () => {
              set($carousel.scrollSnapList().length);
            };
            $carousel.on('init', updateLength);
            $carousel.on('reInit', updateLength);
            $carousel.on('slidesChanged', updateLength);
            return () => {
              $carousel.off('init', updateLength);
              $carousel.off('reInit', updateLength);
              $carousel.off('slidesChanged', updateLength);
            };
          })),
      ).readonly;

    indicatorsContext = {
      intrinsicIndexOccupants: new Signal(/** @type {HTMLElement[]} */ ([])),
    };
  },
  (
    element,
    {
      carousel,
      contentContainer,
      plugins,

      align,
      axis,
      containScroll,
      direction,
      dragFree,
      dragThreshold,
      duration,
      inViewThreshold,
      loop,
      skipSnaps,
      slidesToScroll,
      startIndex,
    },
    { registerLocalBehaviors },
  ) => {
    registerLocalBehaviors(
      CarouselContentBehavior,
      CarouselItemBehavior,
      CarouselIndicatorBehavior,
      CarouselPrevBehavior,
      CarouselNextBehavior,

      CarouselHashBehavior,
      CarouselAutoHeightBehavior,
    );

    const _ = bin();

    // attach content to first element if no content behavior
    _._ = subscribeSelectorAll([element, ':scope > :first-child'], (element) =>
      contentContainer.subscribe((it) => {
        if (it) return;
        if (!(element instanceof HTMLElement)) return;

        const _ = bin();

        if (!hasAttachedBehavior(element, CarouselContentBehavior))
          _._ = attachBehavior(element, CarouselContentBehavior, {});

        return _;
      }));

    carousel.in(
      derive(
        {
          contentContainer,
          plugins,
          options: derive({
            align,
            axis,
            containScroll,
            direction,
            dragFree,
            dragThreshold,
            duration,
            inViewThreshold,
            loop,
            skipSnaps,
            slidesToScroll,
            startIndex,
          }),
        },
        ({ $contentContainer, $plugins, $options }) => {
          try {
            return EmblaCarousel(
              element,
              {
                container: $contentContainer ?? null,
                .../** @type {any} */ (omitNullish($options)),
              },
              [...$plugins],
            );
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
          }
        },
      ),
    );
    _._ = carousel.subscribe((it) => () => {
      it?.destroy();
    });

    return _;
  },
);

registerGlobalBehaviors(CarouselBehavior);
