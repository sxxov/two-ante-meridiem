import { bin, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { some } from './lib-type-some.js';
/** @import {Values} from './lib-utilities-Values.js' */

const Milliseconds = /** @type {const} */ ({
  Second: 1000,
  Minute: 60_000,
  Hour: 3_600_000,
  Day: 86_400_000,
});
/** @typedef {Values<typeof Milliseconds>} Milliseconds */

const Strategy = /** @type {const} */ ({
  SetTimeout: 'setTimeout',
  RequestAnimationFrame: 'requestAnimationFrame',
});
/** @typedef {Values<typeof Strategy>} Strategy */

export const TextCountdownBehavior = behavior(
  'text-countdown',
  class {
    time = t.string;
    targetTimestamp = this.time.derive((t) => parseTime(t ?? '')?.getTime());
    format = t.string.default('hh:mm:ss');

    strategy = this.format.derive((it) =>
      /S+/.test(it) ? Strategy.RequestAnimationFrame : Strategy.SetTimeout,
    );
    interval = this.format.derive((it) => {
      const millisecondDigitMatches = it.match(/S+/g);

      switch (true) {
        case millisecondDigitMatches && millisecondDigitMatches.length > 0: {
          const maxDigits = Math.max(
            ...millisecondDigitMatches.map((match) =>
              Math.min(match.length, 3),
            ),
          );
          const step = Math.max(4, Math.round(1000 / 10 ** maxDigits));

          return step;
        }
        case /[s]/i.test(it): { return Milliseconds.Second; }
        case /[m]/i.test(it): { return Milliseconds.Minute; }
        case /[h]/i.test(it): { return Milliseconds.Hour; }
        default: { return Milliseconds.Day; }
      }
    });
  },
  (element, { targetTimestamp, format, strategy, interval }, {}) => {
    setAttributes(element, {
      role: 'timer',
      'aria-live': 'off',
    });

    const _ = bin();

    _._ = subscribe(
      { targetTimestamp, format, strategy, interval },
      ({ $targetTimestamp, $format, $strategy, $interval }) => {
        if (!some($targetTimestamp)) return;

        const remaining = () => Math.max(0, $targetTimestamp - Date.now());
        const render = () => {
          const text = formatDuration(remaining(), $format);
          element.textContent = text;
        };

        switch ($strategy) {
          case Strategy.RequestAnimationFrame: {
            let rafHandle = requestAnimationFrame(function tick() {
              render();

              if (remaining() <= 0) return;
              rafHandle = requestAnimationFrame(tick);
            });
            return () => { cancelAnimationFrame(rafHandle); };
          }
          case Strategy.SetTimeout: {
            const timeoutDelay = () => computeDelay($interval, remaining());
            let timeoutHandle = setTimeout(function tick() {
              render();

              if (remaining() <= 0) return;
              timeoutHandle = setTimeout(tick, timeoutDelay());
            }, timeoutDelay());
            return () => { clearTimeout(timeoutHandle); };
          }
          default:
        }
      },
    );

    return _;
  },
);

registerGlobalBehaviors(TextCountdownBehavior);

function parseTime(/** @type {string} */ value) {
  if (!value) return;

  const trimmed = value.trim();
  if (!trimmed) return;

  if (/^-?\d+$/.test(trimmed)) {
    const number = Number(trimmed);
    if (!Number.isFinite(number)) return null;
    const multiplier = trimmed.length <= 10 ? 1000 : 1;
    const date = new Date(number * multiplier);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  let date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return date;

  date = new Date(trimmed.replace(' ', 'T'));
  if (!Number.isNaN(date.getTime())) return date;
}

function formatDuration(
  /** @type {number} */ ms,
  /** @type {string} */ format,
) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = safeMs % 1000;

  return format.replace(
    /(d{1,2}|D{1,2}|h{1,2}|H{1,2}|m{1,2}|M{1,2}|s{1,2}|S{1,3})/g,
    (/** @type {string} */ token) => {
      if (token.startsWith('S')) {
        const digits = Math.min(token.length, 3);
        const divisor = 10 ** digits;
        const value = Math.floor((milliseconds / 1000) * divisor);

        return `${value}`.padStart(digits, '0');
      }

      const { length } = token;
      const [first] = token;
      if (!some(first)) return token;

      switch (first.toLowerCase()) {
        case 'd':
          return `${days}`.padStart(length, '0');
        case 'h':
          return `${hours}`.padStart(length, '0');
        case 'm':
          return `${minutes}`.padStart(length, '0');
        case 's':
          return `${seconds}`.padStart(length, '0');
        default:
          return token;
      }
    },
  );
}

function computeDelay(
  /** @type {number} */ interval,
  /** @type {number} */ remaining,
) {
  if (interval >= Milliseconds.Second) {
    const mod = remaining % interval;
    return mod > 0 ? mod : interval;
  }

  return interval;
}
