import { behavior, registerGlobalBehaviors } from './lib-behavior.js';
import { Signal, derive, subscribe } from './lib-signal.js';
import EmblaCarousel from './lib-package-embla-carousel.js';
import { setStyles } from './lib-dom-setStyles.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { some } from './lib-functional-some.js';
/** @import {ReadableSignal} from './lib-signal.js' */

// TODO: this is another very dirty re-implementation of marquee as a behavior
export const LighboxBehavior = behavior(
  'lightbox',
  class {
    //
  },
  (element, {}, {}) => {
    const images = [
      .../** @type {NodeListOf<HTMLImageElement>} */ (
        element.querySelectorAll('img')
      ),
    ];
    for (const [index, image] of images.entries())
      image.setAttribute('data-lightbox-image', `${index}`);

    const selectedIndex = new Signal(0);
    const selectedContainer = new Signal(/** @type {HTMLElement} */ (element));
    const selectedImage = derive({ selectedContainer, selectedIndex }, ({
      $selectedContainer,
      $selectedIndex,
    }) => {
      const containerImage = (() => {
        const image = $selectedContainer.querySelector(
          `[data-lightbox-image="${$selectedIndex}"]`,
        );
        if (!(image instanceof HTMLImageElement)) return;
        return image;
      })();
      if (containerImage) return containerImage;

      const image = images[$selectedIndex];
      if (image) return image;
    });

    const scheduledRecalculateKey = new Signal({});
    const aspect = derive({ selectedImage, scheduledRecalculateKey }, ({
      $selectedImage,
    }) => {
      if (!$selectedImage) return 1;
      return $selectedImage.naturalWidth / $selectedImage.naturalHeight;
    });
    const fromRect = derive({ selectedImage, scheduledRecalculateKey }, ({
      $selectedImage,
    }) => {
      if (!$selectedImage) return new DOMRect();
      return $selectedImage.getBoundingClientRect();
    });
    const toRect = new Signal(/** @type {DOMRect | undefined} */ (undefined));
    // manually activate the above Signals since we're setting stuff up synchronously
    aspect.get();
    fromRect.get();
    toRect.get();

    for (const [index, image] of images.entries()) {
      const link = document.createElement('a');
      setAttributes(link, {
        href: image.src,
        'data-lightbox-link': index,
      });

      image.replaceWith(link);
      link.append(image);
    }
    element.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLElement)) return;

      const link = e.target.closest('[data-lightbox-link]');
      if (!(link instanceof HTMLElement)) return;

      const container = link.closest('[data-lightbox]');
      if (!(container instanceof HTMLElement)) return;
      selectedContainer.set(container);

      const index = Number(link.getAttribute('data-lightbox-link'));
      if (!Number.isFinite(index)) return;
      selectedIndex.set(index);

      e.preventDefault();

      const open = new Signal(true);
      const onDismiss = () => {
        open.set(false);
      };
      open.subscribe(() => {
        scheduledRecalculateKey.set({});
      });

      const lightboxDialog = LightboxDialog(
        {
          open,
        },
        LightboxContainer(
          {
            onDismiss,
            aspect,
            // eslint-disable-next-line object-shorthand
            fromRect: /** @type {ReadableSignal<DOMRect | undefined>} */ (
              fromRect
            ),
            toRect,
          },
          LightboxCarousel({
            images,
            selectedIndex,
            toRect,
          }),
        ),
        LightboxClose({ onDismiss }),
      );

      document.body.append(lightboxDialog);
    });
  },
);

registerGlobalBehaviors(LighboxBehavior);

function LightboxContainer(
  /**
   * @type {{
   *   onDismiss?: () => void;
   *   aspect: ReadableSignal<number>;
   *   fromRect: ReadableSignal<DOMRect | undefined>;
   *   toRect: Signal<DOMRect | undefined>;
   * }}
   */ { onDismiss, aspect, fromRect, toRect },
  /** @type {Node[]} */ ...children
) {
  const lightboxContainer = document.createElement('div');
  setAttributes(lightboxContainer, {
    'data-lightbox-container': true,
  });
  lightboxContainer.addEventListener('click', () => {
    toRect.set(undefined);
    onDismiss?.();
  });

  subscribe({ aspect, fromRect, toRect }, ({ $aspect, $fromRect, $toRect }) => {
    if (!$fromRect || !$toRect) return;

    queueMicrotask(() => {
      const fromX = $fromRect.x + $fromRect.width / 2;
      const fromY = $fromRect.y + $fromRect.height / 2;
      const toX = $toRect.x + $toRect.width / 2;
      const toY = $toRect.y + $toRect.height / 2;

      const diffX = toX - fromX;
      const diffY = toY - fromY;
      const scaleX = $toRect.width / $fromRect.width;
      const scaleY =
        // workaround chrome browser bug that renders svgs inside img tags with 0 height
        // during forced reflow, but calculates the correct width & layout with the corresponding
        // height. so, we just manually calculate the height using said correct width
        ($toRect.height || $toRect.width / $aspect) / $fromRect.height;

      setStyles(lightboxContainer, {
        '--diff-x': `${-diffX}px`,
        '--diff-y': `${-diffY}px`,
        '--diff-scale-x': `${1 / scaleX}`,
        '--diff-scale-y': `${1 / scaleY}`,
        '--origin-x': `${toX}px`,
        '--origin-y': `${toY}px`,
      });
    });
  });

  lightboxContainer.append(...children);

  return lightboxContainer;
}

function LightboxClose(
  /** @type {{ onDismiss?: () => void }} */ { onDismiss },
) {
  const lightboxClose = document.createElement('button');
  setAttributes(lightboxClose, {
    'data-lightbox-close': true,
  });
  lightboxClose.addEventListener('click', () => {
    onDismiss?.();
  });

  return lightboxClose;
}

function LightboxDialog(
  /** @type {{ open: ReadableSignal<boolean> }} */ { open },
  /** @type {Node[]} */ ...children
) {
  const lightboxDialog = document.createElement('dialog');
  setAttributes(lightboxDialog, {
    'data-lightbox-dialog': true,
  });
  const openDialog = () => {
    setAttributes(lightboxDialog, {
      'data-lightbox-dialog': 'open',
    });
    lightboxDialog.showModal();
  };
  const closeDialog = () => {
    setAttributes(lightboxDialog, {
      'data-lightbox-dialog': 'close',
    });

    const remove = () => {
      console.log('remove');
      lightboxDialog.close();
      lightboxDialog.remove();

      setAttributes(lightboxDialog, {
        'data-lightbox-dialog': true,
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const { transition } = getComputedStyle(lightboxDialog);
        if (transition) {
          const controller = new AbortController();
          const { signal } = controller;
          const onTransitionEnd = (/** @type {TransitionEvent} */ event) => {
            if (
              event.target !== event.currentTarget ||
              event.pseudoElement ||
              event.propertyName.includes('scrollbar-')
            )
              return;

            remove();
            controller.abort();
          };
          lightboxDialog.addEventListener('transitionend', onTransitionEnd, {
            signal,
          });
          lightboxDialog.addEventListener('transitioncancel', onTransitionEnd, {
            signal,
          });
        } else remove();
      });
    });
  };
  lightboxDialog.addEventListener('click', (e) => {
    if (e.target === lightboxDialog) closeDialog();
    console.log('click');
  });
  open.subscribe((it) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (it) openDialog();
        else closeDialog();
        console.log('open', it);
      });
    });
  });

  lightboxDialog.append(...children);

  return lightboxDialog;
}

function LightboxCarousel(
  /**
   * @type {{
   *   images: HTMLImageElement[];
   *   selectedIndex?: Signal<number>;
   *   toRect?: Signal<DOMRect | undefined>;
   * }}
   */ { images, selectedIndex = new Signal(0), toRect },
) {
  const lightboxCarousel = document.createElement('div');
  setAttributes(lightboxCarousel, {
    'data-lightbox-carousel': true,
  });

  const lightboxCarouselItems = document.createElement('div');
  setAttributes(lightboxCarouselItems, {
    'data-lightbox-carousel-items': true,
  });
  lightboxCarousel.append(lightboxCarouselItems);

  if (images.length <= 0) return lightboxCarousel;

  const items = images.map((it, i) => {
    const aspect = it.naturalWidth / it.naturalHeight;

    const img = document.createElement('img');
    setAttributes(img, {
      src: it.src,
      alt: it.alt || '',
    });
    const item = document.createElement('div');
    setAttributes(item, {
      'data-lightbox-carousel-item': true,
      style: {
        '--aspect': `${aspect}`,
      },
    });
    item.append(img);
    item.addEventListener('click', (e) => {
      if (i === selectedIndex.get()) return;

      e.stopPropagation();
      selectedIndex.set(i);
    });

    return item;
  });
  lightboxCarouselItems.append(...items);

  const embla = EmblaCarousel(lightboxCarousel, {
    startIndex: selectedIndex.get(),
  });
  const length = new Signal(embla.scrollSnapList().length);
  embla.on('init', () => {
    length.set(embla.scrollSnapList().length);
  });
  embla.on('select', () => {
    const index = embla.selectedScrollSnap();
    selectedIndex.set(index);
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      embla.scrollTo(selectedIndex.get(), true);
    });
  });
  subscribe({ selectedIndex }, ({ $selectedIndex }) => {
    embla.scrollTo($selectedIndex);
  });

  if (toRect) {
    const toRectCalculated = derive({ toRect }, ({ $toRect }) => some($toRect));
    const calculateToRect = (/** @type {number} */ index) => {
      const item = items[index];
      if (!item) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const rect = (item.firstElementChild ?? item).getBoundingClientRect();
          toRect.set(rect);
        });
      });
    };
    // recalculate toRect the first time & when it's invalidated
    subscribe({ selectedIndex, toRectCalculated }, ({
      $selectedIndex,
      $toRectCalculated,
    }) => {
      if ($toRectCalculated) return;
      calculateToRect($selectedIndex);
    });
    // recalculate toRect when selectedIndex changes
    subscribe({ selectedIndex }, ({ $selectedIndex }) => {
      calculateToRect($selectedIndex);
    });
  }

  const hasNext = derive(
    { selectedIndex, length },
    ({ $selectedIndex, $length }) => $selectedIndex < $length - 1,
  );
  const hasPrev = derive(
    { selectedIndex },
    ({ $selectedIndex }) => $selectedIndex > 0,
  );
  const nextButton = document.createElement('button');
  setAttributes(nextButton, {
    'data-lightbox-carousel-next': true,
  });
  nextButton.addEventListener('click', (event) => {
    event.stopPropagation();
    embla.scrollNext();
  });
  subscribe({ hasNext }, ({ $hasNext }) => {
    nextButton.disabled = !$hasNext;
  });
  const prevButton = document.createElement('button');
  setAttributes(prevButton, {
    'data-lightbox-carousel-prev': true,
  });
  prevButton.addEventListener('click', (event) => {
    event.stopPropagation();
    embla.scrollPrev();
  });
  subscribe({ hasPrev }, ({ $hasPrev }) => {
    prevButton.disabled = !$hasPrev;
  });
  lightboxCarousel.append(nextButton, prevButton);

  return lightboxCarousel;
}
