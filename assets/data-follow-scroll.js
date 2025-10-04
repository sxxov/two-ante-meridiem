import { bin } from './lib-signal.js';
import { subscribeFrame } from './lib-animation-subscribeFrame.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { watchElementRect } from './lib-dom-watchElementRect.js';
import { some } from './lib-functional-some.js';
import { viewportSize } from './lib-viewport-viewportSize.js';
import { clamp01 } from './lib-math-clamp01.js';
import { map01 } from './lib-math-map01.js';
import { lerp } from './lib-math-lerp.js';

export const FollowScrollBehavior = behavior(
  'follow-scroll',
  class {
    x = t.number.transient();
    xIn = t.number.transient();
    xOut = t.number.transient();
    xInOut = t.number.transient();
    xBetween = t.number.transient();

    y = t.number.transient();
    yIn = t.number.transient();
    yOut = t.number.transient();
    yInOut = t.number.transient();
    yBetween = t.number.transient();
  },
  (element, {
    x, xIn, xOut, xInOut, xBetween, y, yIn, yOut, yInOut, yBetween
  }, {}) => {
    const _ = bin();
    const rect = watchElementRect(element);
    _._ = rect.subscribe(() => { /* */ });

    _._ = subscribeFrame(() => {
      const { x: $left, width: $width } = rect.get();
		const { width: $vw } = viewportSize.get();
		if (!some($left) || !some($width) || !$vw) return;

		const inStart = $left - $vw;
		const inEnd = $left - $vw + Math.min($width, $vw);
		const inProgress = clamp01(map01(window.scrollX, inStart, inEnd));
		const outStart = $left + Math.max($width - $vw, 0);
		const outEnd = $left + $width;
		const outProgress = clamp01(map01(window.scrollX, outStart, outEnd));
		const inOutProgress =
			lerp(inProgress, 0, 0.5) + lerp(outProgress, 0, 0.5);

		const betweenProgress = clamp01(map01(window.scrollX, inEnd, outStart));
		const overallProgress = clamp01(map01(window.scrollX, inStart, outEnd));

        x.set(overallProgress);
        xIn.set(inProgress);
        xOut.set(outProgress);
        xInOut.set(inOutProgress);
        xBetween.set(betweenProgress);
    });

    _._ = subscribeFrame(() => {
      const { y: $top, height: $height } = rect.get();
		const { height: $vh } = viewportSize.get();
		if (!some($top) || !some($height) || !$vh) return;

		const inStart = $top - $vh;
		const inEnd = $top - $vh + Math.min($height, $vh);
		const inProgress = clamp01(map01(window.scrollY, inStart, inEnd));
		const outStart = $top + Math.max($height - $vh, 0);
		const outEnd = $top + $height;
		const outProgress = clamp01(map01(window.scrollY, outStart, outEnd));
		const inOutProgress =
			lerp(inProgress, 0, 0.5) + lerp(outProgress, 0, 0.5);

		const betweenProgress = clamp01(map01(window.scrollY, inEnd, outStart));
		const overallProgress = clamp01(map01(window.scrollY, inStart, outEnd));

        y.set(overallProgress);
        yIn.set(inProgress);
        yOut.set(outProgress);
        yInOut.set(inOutProgress);
        yBetween.set(betweenProgress);
    });

    return _;
  },
);

registerGlobalBehaviors(FollowScrollBehavior);