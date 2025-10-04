import { subscribe, bin, Signal } from './lib-signal.js';
import { CarouselBehavior } from './data-carousel.js';
import { behavior, t } from './lib-behavior.js';
import { some } from './lib-functional-some.js';
import { unset } from './lib-functional-unset.js';

export const CarouselIndicatorBehavior = behavior(
  'carousel-indicator',
  class {
    '' = t.string;
    selected = t.boolean.transient();
  },
  (element, { '': value, selected }, { getContext }) =>
    subscribe({ carousel: getContext(CarouselBehavior) }, ({ $carousel }) => {
      if (!$carousel) return;

      const {
        carousel,
        indicatorsContext: { intrinsicIndexOccupants },
        selectedIndex,
      } = $carousel;
      const _ = bin();
      const range = new Signal(
        {
          start: unset(Number),
          end: unset(Number),
        },
        ({ set }) =>
          subscribe({ value }, ({ $value }) => {
            specified: {
              if ($value === '' || !some($value)) break specified;

              // specified range
              if ($value.includes('..')) {
                const [start, end] = $value.split('..').map(Number);
                if (
                  start !== undefined &&
                  !Number.isNaN(start) &&
                  end !== undefined &&
                  !Number.isNaN(end)
                ) {
                  set({ start, end });
                  return;
                }
              }

              // specified index
              const targetAttributeNumber = Number($value);
              if (!Number.isNaN(targetAttributeNumber)) {
                set({
                  start: targetAttributeNumber,
                  end: targetAttributeNumber,
                });
                return;
              }

              break specified;
            }

            intrinsic: {
              // fallback to intrinsic index

              _._ = subscribe({ intrinsicIndexOccupants }, ({
                $intrinsicIndexOccupants,
              }) => {
                const indexOfElement =
                  $intrinsicIndexOccupants.indexOf(element);
                const i = (() => {
                  if ($intrinsicIndexOccupants.length <= 0) return 0;

                  if (indexOfElement < 0)
                    return $intrinsicIndexOccupants.length;
                  return indexOfElement;
                })();
                set({ start: i, end: i });
                intrinsicIndexOccupants.update((it) => {
                  if (it[i] === element) return it;

                  it[i] = element;
                  intrinsicIndexOccupants.trigger();
                  return it;
                });
              });
              _._ = () => {
                set({ start: undefined, end: undefined });
                intrinsicIndexOccupants.update((it) => {
                  if (!it.includes(element)) return it;
                  return it.filter((item) => item !== element);
                });
              };
            }
          }),
      );

      _._ = subscribe({ range, carousel }, ({
        $range: { start: $start = 0 },
        $carousel,
      }) => {
        if (!$carousel) return;

        const controller = new AbortController();
        const { signal } = controller;

        element.addEventListener(
          'click',
          () => {
            // force a 'select' event if the selected index is already the same
            const needsSyntheticEvent =
              $carousel.selectedScrollSnap() === $start;
            $carousel.scrollTo($start);
            if (needsSyntheticEvent) $carousel.emit('select');
          },
          { signal },
        );

        return () => {
          controller.abort();
        };
      });

      _._ = subscribe({ range, selectedIndex }, ({
        $range: { start: $start = 0, end: $end = 0 },
        $selectedIndex,
      }) => {
        const indicating = $selectedIndex >= $start && $selectedIndex <= $end;
        selected.set(indicating);
      });

      return _;
    }),
);
