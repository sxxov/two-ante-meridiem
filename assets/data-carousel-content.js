import { subscribe, bin } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior, detachBehavior, attachBehavior } from './lib-behavior.js';
import { CarouselItemsBehavior } from './data-carousel-items.js';

export const CarouselContentBehavior = behavior(
  'carousel-content',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, ({ $carousel }) => {
      const validElement = findNonContentsDescendent(element);
      if (validElement !== element) {
        detachBehavior(element, CarouselContentBehavior);

        if (validElement)
          attachBehavior(validElement, CarouselContentBehavior, {});

        return;
      }

      if (!$carousel) return;

      const { contentContainer } = $carousel;
      const _ = bin();

      attach: {
        const $contentContainer = contentContainer.get();
        if (!$contentContainer?.contains(element))
          contentContainer.set(element);
      }
      detach: _._ = () => {
        const $contentContainer = contentContainer.get();
        if ($contentContainer === element) contentContainer.set(undefined);
      };

      _._ = attachBehavior(element, CarouselItemsBehavior, {});

      return _;
    }),
);

export function findNonContentsDescendent(/** @type {HTMLElement} */ element) {
  if (!isNodeDisplayContents(element)) return element;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (!(node instanceof HTMLElement) || isNodeDisplayContents(node))
        return NodeFilter.FILTER_SKIP;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  return /** @type {HTMLElement | null} */ (walker.nextNode());
}

function isNodeDisplayContents(/** @type {Element} */ node) {
  const { display } = getComputedStyle(node);
  return display === 'contents';
}
