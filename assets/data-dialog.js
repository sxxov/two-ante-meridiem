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
    mode = t.string.choice('consume').choice('move').default('move');

    visible = t.boolean.backing();
    content = new TaskSignal(
      /** @type {HTMLElement | undefined} */ (undefined),
    );
  },
  (element, { open, visible, content, mode }, { registerLocalBehaviors }) => {
    registerLocalBehaviors(
      DialogCloseBehavior,
      DialogContentBehavior,
      DialogTriggerBehavior,
    );

    const _ = bin();

    const dialog = document.createElement('dialog');
    _._ = attachBehavior(dialog, DialogContainerBehavior, {});

    _._ = subscribe({ mode, content }, ({ $mode, $content }) => {
      if ($mode !== 'consume' || !$content) return;

      const _ = bin();

      const placeholderComment = document.createComment('');
      add: {
        element.append(dialog);
        $content.replaceWith(placeholderComment);
        dialog.append($content);
      }
      remove: _._ = () => {
        dialog.remove();
        placeholderComment.replaceWith($content);
      };

      return _;
    });

    _._ = subscribe({ open, mode, content }, ({ $open, $mode, $content }) => {
      if (!$open || !$content) return;

      const _ = bin();

      switch ($mode) {
        case 'consume': {
          add: {
            dialog.showModal();
            visible.set(true);
          }
          remove: _._ = () => {
            visible.set(false);
            dialog.close();
          };

          break;
        }
        case 'move': {
          const placeholderComment = document.createComment('');
          $content.replaceWith(placeholderComment);
          add: { dialog.append($content); }
          remove: _._ = () => { placeholderComment.replaceWith($content); };

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

          break;
        }
        default:
      }

      return _;
    });

    return _;
  },
);

queueMicrotask(() => { registerGlobalBehaviors(DialogBehavior); });
