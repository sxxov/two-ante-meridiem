import { subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { FollowChildRectBehavior } from './data-follow-child-rect.js';

export const FollowChildRectTargetBehavior = behavior(
  'follow-child-rect-target',
  class {},
  (element, {}, { getContext }) =>
    subscribe({ followChildRectTarget: getContext(FollowChildRectBehavior) }, ({
      $followChildRectTarget,
    }) => {
      if (!$followChildRectTarget) return;

      const { target } = $followChildRectTarget;
      const previousTarget = target.get();
      target.set(element);
      return () => {
        if (target.get() === element) target.set(previousTarget);
      };
    }),
);
