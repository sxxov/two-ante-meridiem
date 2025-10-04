import { EffectSignal } from './lib-signal-EffectSignal.js';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { pushState, replaceState } = history;
let patchReferenceCount = 0;

export const route = new EffectSignal(
  location.href,
  (value) => {
    pushState.call(history, {}, document.title, value);
  },
  () => {
    const update = () => {
      route.set(location.href, false);
    };

    if (patchReferenceCount++ <= 0) {
      history.pushState = function (...args) {
        pushState.apply(this, args);
        route.set(location.href);
      };
      history.replaceState = function (...args) {
        replaceState.apply(this, args);
        route.set(location.href);
      };
    }

    const controller = new AbortController();
    const { signal } = controller;

    // listen for popstate events
    window.addEventListener('popstate', update, { signal });

    return () => {
      controller.abort();

      if (--patchReferenceCount <= 0) {
        history.pushState = pushState;
        history.replaceState = replaceState;
      }
    };
  },
);
