import { CarouselItemBehavior } from './data-carousel-item.js';
import { attachBehavior, behavior } from './lib-behavior.js';
import { bin } from './lib-signal.js';

export const CarouselItemsBehavior = behavior(
  'carousel-items',
  class {},
  (element, {}, {}) => {
    const _ = bin();

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
    _._ = () => { mo.disconnect(); };
    _._ = () => {
      for (const detach of nodeDetachBehaviors.values()) detach();
    };

    return _;
  },
);
