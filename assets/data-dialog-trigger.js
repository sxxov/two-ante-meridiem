import { bin, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { DialogBehavior } from './data-dialog.js';

export const DialogTriggerBehavior = behavior(
  'dialog-trigger',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ dialog: getContext(DialogBehavior) }, ({ $dialog }) => {
      if (!$dialog) return;

      const { open } = $dialog;

      const _ = bin();
      const controller = new AbortController();
      const { signal } = controller;
      _._ = () => { controller.abort(); };

      element.addEventListener('click', () => { open.set(true); }, { signal });

      return _;
    }),
);
