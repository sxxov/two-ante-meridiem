import { DialogBehavior } from './data-dialog.js';
import { behavior, registerGlobalBehaviors } from './lib-behavior.js';
import { bin, subscribe } from './lib-signal.js';

export const DialogContainerBehavior = behavior(
  'dialog-container',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ dialog: getContext(DialogBehavior) }, ({ $dialog }) => {
      if (!$dialog) return;

      const _ = bin();
      const controller = new AbortController();
      const { signal } = controller;
      _._ = () => { controller.abort(); };

      const { open, visible } = $dialog;

      element.addEventListener(
        'click',
        (event) => {
          if (event.target !== element) return;

          const { transitionProperty } = getComputedStyle(element);
          if (transitionProperty === 'none') {
            open.set(false);
            return;
          }

          visible.set(false);
          const close = (/** @type {TransitionEvent} */ event) => {
            if (
              event.target !== event.currentTarget ||
              event.propertyName.startsWith('scrollbar')
            )
              return;
            open.set(false);
          };
          element.addEventListener('transitionend', close, { signal });
          element.addEventListener('transitioncancel', close, { signal });
        },
        { signal },
      );

      return _;
    }),
);

registerGlobalBehaviors(DialogContainerBehavior);
