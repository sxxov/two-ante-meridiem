import { bin, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { DialogBehavior } from './data-dialog.js';

export const DialogContentBehavior = behavior(
  'dialog-content',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ dialog: getContext(DialogBehavior) }, ({ $dialog }) => {
      if (!$dialog) return;

      const { content } = $dialog;

      content.set(element);
    }),
);
