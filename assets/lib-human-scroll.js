import { EffectSignal } from './lib-signal-EffectSignal.js';

export const scrollY = new EffectSignal(
  0,
  (top) => {
    window.scrollTo({
      top,
    });
  },
  ({ set }) => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = () => {
      // use pageYOffset as it's read-only & can't be clobbered
      set(window.pageYOffset, false);
    };

    update();
    window.addEventListener('scroll', update, { signal });

    return () => {
      controller.abort();
    };
  },
);

export const scrollX = new EffectSignal(
  0,
  (left) => {
    window.scrollTo({
      left,
    });
  },
  ({ set }) => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = () => {
      // use pageXOffset as it's read-only & can't be clobbered
      set(window.pageXOffset, false);
    };

    update();
    window.addEventListener('scroll', update, { signal });

    return () => {
      controller.abort();
    };
  },
);
