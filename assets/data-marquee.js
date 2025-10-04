import { bin, derive, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { watchElementRect } from './lib-dom-watchElementRect.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { viewportSize } from './lib-viewport-viewportSize.js';
import { scrollY } from './lib-human-scroll.js';
import { clamp01 } from './lib-math-clamp01.js';
import { map01 } from './lib-math-map01.js';
import { setStyles } from './lib-dom-setStyles.js';
import EmblaCarousel from './lib-package-embla-carousel.js';
import { unwrap } from './lib-functional-unwrap.js';

// TODO: this is a very dirty re-implementation of marquee as a behavior. we'll
// need to actually rethink how to structure it instead of doing all these raw
// dom manipulations.
export const MarqueeBehavior = behavior(
  'marquee',
  class {
    direction = t.number.default(1);
    axis = t.string.choice('x').choice('y').default('x');
    duration = t.number.default(20_000);
    amplitude = t.number.default(0.5);
  },
  (element, { axis, amplitude }, {}) => {
    const _ = bin();

    const children = [...element.children];
    _._ = () => { element.replaceChildren(...children); };

    const container = element;
    const containerRect = watchElementRect(container);

    const seeker = document.createElement('div');
    setAttributes(seeker, {
      'data-marquee-seeker': true,
    });
    container.append(seeker);

    const content = document.createElement('div');
    setAttributes(content, {
      'data-marquee-content': true,
    });
    seeker.append(content);
    const progress = derive({ scrollY, containerRect, viewportSize }, ({
      $scrollY,
      $containerRect: { y: $containerY = 0, height: $containerHeight = 0 },
      $viewportSize: { height: $vh },
    }) =>
      clamp01(
        map01($scrollY, $containerY - $vh, $containerY + $containerHeight),
      ));
    _._ = subscribe({ viewportSize, progress, axis, amplitude }, ({
      $viewportSize: { width: $vw },
      $progress,
      $axis,
      $amplitude,
    }) => {
      // TODO: don't hard code the px amount
      // probably expose this as a global store?
      const amount = $vw <= 640 ? '0' : (
        `${($progress - 1) * $amplitude * -100}%`
      );

      setStyles(content, {
        translate: (() => {
          switch ($axis) {
            case 'x':
              return `${amount} 0`;
            case 'y':
              return `0 ${amount}`;
            default:
              return '';
          }
        })(),
      });
    });

    const contentItems = document.createElement('div');
    setAttributes(contentItems, {
      'data-marquee-content-items': true,
    });
    contentItems.append(...children);
    const contentItemsRect = watchElementRect(contentItems);
    _._ = () => {
      contentItemsRect.destroy();
    };
    _._ = subscribe({ contentItemsRect }, ({
      $contentItemsRect: { width: $width, height: $height },
    }) => {
      setStyles(container, {
        '--height': `${$height}px`,
        '--width': `${$width}px`,
      });
    });

    const items = derive({ contentItemsRect, containerRect, axis }, ({
      $contentItemsRect: {
        width: $contentItemsWidth = 0,
        height: $contentItemsHeight = 0,
      },
      $containerRect: {
        width: $containerWidth = 0,
        height: $containerHeight = 0,
      },
      $axis,
    }) =>
      Array.from(
        {
          length: Math.ceil(
            unwrap(
              {
                x: $contentItemsWidth ?
                  $containerWidth / $contentItemsWidth
                : 0,
                y: $contentItemsHeight ?
                  $containerHeight / $contentItemsHeight
                : 0,
              }[$axis],
            ),
          ),
        },
        () => {
          const wrapper = document.createElement('div');
          setAttributes(wrapper, {
            'data-marquee-item': true,
          });
          wrapper.replaceChildren(
            ...children.map((child) => child.cloneNode(true)),
          );
          return wrapper;
        },
      ));

    const contentBefore = document.createElement('div');
    setAttributes(contentBefore, {
      'data-marquee-content-items-before': true,
    });
    _._ = subscribe({ items }, ({ $items }) => {
      contentBefore.replaceChildren(...$items.map((it) => it.cloneNode(true)));
      return () => {
        contentBefore.replaceChildren();
      };
    });

    const contentAfter = document.createElement('div');
    setAttributes(contentAfter, {
      'data-marquee-content-items-after': true,
    });
    const contentAfterAfter = document.createElement('div');
    setAttributes(contentAfterAfter, {
      'data-marquee-content-items-after-after': true,
    });
    _._ = subscribe({ items }, ({ $items }) => {
      contentAfter.replaceChildren(...$items.map((it) => it.cloneNode(true)));
      contentAfterAfter.replaceChildren(
        ...$items.map((it) => it.cloneNode(true)),
      );
      return () => {
        contentAfter.replaceChildren();
        contentAfterAfter.replaceChildren();
      };
    });

    content.append(contentBefore);
    content.append(contentItems);
    content.append(contentAfter);
    content.append(contentAfterAfter);

    _._ = subscribe({ axis }, ({ $axis }) => {
      const carousel = EmblaCarousel(seeker, {
        loop: true,
        skipSnaps: true,
        dragFree: true,
        axis: /** @type {any} */ ($axis),
      });
      return () => { carousel.destroy(); };
    });

    return _;
  },
);

registerGlobalBehaviors(MarqueeBehavior);
