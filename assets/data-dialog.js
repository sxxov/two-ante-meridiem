import { bin, Signal, subscribe } from './lib-signal.js';
import {
  attachBehavior,
  behavior,
  registerGlobalBehaviors,
  t,
} from './lib-behavior.js';
import { DialogContainerBehavior } from './data-dialog-container.js';
import { DialogCloseBehavior } from './data-dialog-close.js';
import { DialogContentBehavior } from './data-dialog-content.js';
import { DialogTriggerBehavior } from './data-dialog-trigger.js';
import { TaskSignal } from './lib-signal-TaskSignal.js';

export const DialogBehavior = behavior(
  'dialog',
  class {
    open = t.boolean;
    visible = t.boolean.backing();
    content = new TaskSignal(
      /** @type {HTMLElement | undefined} */ (undefined),
    );
  },
  (element, { open, visible, content }, { registerLocalBehaviors }) => {
    registerLocalBehaviors(
      DialogCloseBehavior,
      DialogContentBehavior,
      DialogTriggerBehavior,
    );

    const _ = bin();

    _._ = subscribe({ open, content }, ({ $open, $content }) => {
      if (!$open || !$content) return;

      const _ = bin();

      const dialog = document.createElement('dialog');
      attachBehavior(dialog, DialogContainerBehavior, {});

      const contentPlaceholderComment = document.createComment('');
      $content.replaceWith(contentPlaceholderComment);
      add: { dialog.appendChild($content); }
      remove: _._ = () => { contentPlaceholderComment.replaceWith($content); };

      add: {
        element.append(dialog);
        dialog.showModal();
        visible.set(true);
      }
      remove: _._ = () => {
        visible.set(false);
        dialog.close();
        dialog.remove();
      };

      return _;
    });

    return _;
  },
);

queueMicrotask(() => { registerGlobalBehaviors(DialogBehavior); });
