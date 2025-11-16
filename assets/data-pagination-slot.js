import { bin, derive, subscribe } from './lib-signal.js';
import {
  attachBehavior,
  behavior,
  getAttachedBehavior,
  t,
} from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';
import { PaginationBehavior } from './data-pagination.js';
import { BehaviorPropDeserialization } from './lib-behavior-prop-BehaviorPropDeserialization.js';
import { getBehaviorAttributeName } from './lib-behavior-serialization-getBehaviorAttributeName.js';

export const PaginationSlotBehavior = behavior(
  'pagination-slot',
  class {
    '' = t.number.choice(-1).choice(1).default(1);
    index = t.number.backing().default(1);
    hydrated = t.boolean
      .backing()
      .default(false)
      .deserialize(BehaviorPropDeserialization.None);
  },
  (element, { '': increment, index, hydrated }, { getContext }) =>
    subscribe(
      { pagination: getContext(PaginationBehavior) },
      ({ $pagination }) => {
        if (!$pagination) return;

        const _ = bin();

        const { indices, section, length } = $pagination;
        _._ = subscribe({ index }, ({ $index }) => {
          add: {
            indices.update((it) => {
              if (it.has($index)) return it;

              it.add($index);
              indices.trigger();
              return it;
            });
          }
          remove: return () => {
            indices.update((it) => {
              if (!it.has($index)) return it;

              it.delete($index);
              indices.trigger();
              return it;
            });
          };
        });

        const nextIndex = derive(
          { index, increment },
          ({ $index, $increment }) => $index + $increment,
        );
        const active = derive(
          { nextIndex, length },
          ({ $nextIndex, $length = 0 }) =>
            $nextIndex >= 1 && $nextIndex <= $length,
        );
        const hasNextIndexSibling = derive(
          { indices, nextIndex },
          ({ $indices, $nextIndex }) => $indices.has($nextIndex),
        );
        const url = derive(
          { increment, index, section },
          ({ $increment, $index, $section }) => {
            const it = new URL(location.href);
            it.searchParams.set('page', `${$index + $increment}`);
            if ($section) it.searchParams.set('section_id', $section);
            return it.href;
          },
        );
        _._ = subscribe({ active, url }, ({ $url, $active }) => {
          if (!$active) return;

          return attachBehavior(element, FragmentBehavior, {
            url: $url,
            selector: `[${getBehaviorAttributeName(PaginationBehavior.name)}] > *`,
            loading: 'lazy',
          });
        });
        const fragment = getAttachedBehavior(element, FragmentBehavior);

        _._ = subscribe({ fragment }, ({ $fragment }) => {
          if (!$fragment) return;

          const { status } = $fragment;
          const _ = bin();

          _._ = subscribe({ status }, ({ $status }) => {
            hydrated.set($status === 'ready');
          });

          return _;
        });

        _._ = subscribe(
          { hydrated, increment, nextIndex },
          ({ $hydrated, $increment, $nextIndex }) => {
            const $hasNextIndexSibling = hasNextIndexSibling.get();
            if (!$hydrated || $hasNextIndexSibling) return;

            const _ = bin();

            const sign = Math.sign($increment);
            const nextElement = document.createElement('div');
            _._ = attachBehavior(nextElement, PaginationSlotBehavior, {
              '': $increment,
              index: $nextIndex,
            });
            add: {
              if (sign >= 0) element.after(nextElement);
              else element.before(nextElement);
            }
            remove: _._ = () => {
              nextElement.remove();
            };

            return _;
          },
        );

        return _;
      },
    ),
);
