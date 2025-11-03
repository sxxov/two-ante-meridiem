import { subscribe, bin } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { CarouselItemBehavior } from './data-carousel-item.js';
import { behavior, detachBehavior, attachBehavior } from './lib-behavior.js';

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

      const previousContentContainer = contentContainer.get();
      contentContainer.set(element);
      _._ = () => {
        if (contentContainer.get() === element)
          contentContainer.set(previousContentContainer);
      };

      const nodeDetachBehaviors =
        new /** @type {typeof Map<HTMLElement, () => void>} */ (Map)();
      for (const child of element.children) {
        if (!(child instanceof HTMLElement)) continue;

        nodeDetachBehaviors.set(
          child,
          attachBehavior(child, CarouselItemBehavior, {}),
        );
      }
      const mo = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            nodeDetachBehaviors.set(
              node,
              attachBehavior(node, CarouselItemBehavior, {}),
            );
          }

          for (const node of mutation.removedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            nodeDetachBehaviors.get(node)?.();
            nodeDetachBehaviors.delete(node);
          }
        }
      });
      mo.observe(element, { childList: true });
      _._ = () => {
        mo.disconnect();
      };

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
