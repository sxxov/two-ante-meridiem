import { bin, Signal, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors } from './lib-behavior.js';
import { watchElementRect } from './lib-dom-watchElementRect.js';
import { setStyles } from './lib-dom-setStyles.js';
import { FollowChildRectTargetBehavior } from './data-follow-child-rect-target.js';

export const FollowChildRectBehavior = behavior(
  'follow-child-rect',
  class {
    target = new Signal(/** @type {HTMLElement | undefined} */ (undefined));
  },
  (element, { target }, { registerLocalBehaviors }) => {
    registerLocalBehaviors(FollowChildRectTargetBehavior);

    const _ = bin();

    _._ = subscribe({ target }, ({ $target }) => {
      if (!($target instanceof HTMLElement)) return;

      const rect = watchElementRect($target);
      return subscribe({ rect }, ({ $rect: { x, y, width, height } }) => {
        setStyles(element, {
          '--follow-child-rect-x': `${x}px`,
          '--follow-child-rect-y': `${y}px`,
          '--follow-child-rect-width': `${width}px`,
          '--follow-child-rect-height': `${height}px`,
        });
      });
    });

    return _;
  },
);

queueMicrotask(() => {
  registerGlobalBehaviors(FollowChildRectBehavior);
});
