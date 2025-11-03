import { Component } from '@theme/component';
import { some } from './lib-type-some.js';

const Milliseconds = /** @type {const} */ ({
  Second: 1000,
  Minute: 60_000,
  Hour: 3_600_000,
  Day: 86_400_000,
});
/** @typedef {(typeof Milliseconds)[keyof typeof Milliseconds]} Milliseconds */

export class XCountdown extends Component {
  static get observedAttributes() {
    return ['time', 'format'];
  }

  /** @type {number | undefined} */
  #targetTimestamp;
  /** @type {string} */
  #format = 'hh:mm:ss';
  /** @type {number} */
  #interval = Milliseconds.Second;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #timerId;
  /** @type {ReturnType<typeof requestAnimationFrame> | undefined} */
  #rafId;
  /** @type {string | undefined} */
  #lastRendered;
  #useAnimationFrame = false;

  connectedCallback() {
    super.connectedCallback();

    if (!this.hasAttribute('role')) this.setAttribute('role', 'timer');
    if (!this.hasAttribute('aria-live')) this.setAttribute('aria-live', 'off');

    const target = this.getAttribute('time');
    if (some(target)) this.#updateTarget(target);
    const format = this.getAttribute('format');
    if (some(format)) this.#updateFormat(format);

    this.#start();
  }

  disconnectedCallback() {
    this.#stop();
    super.disconnectedCallback();
  }

  attributeChangedCallback(
    /** @type {string} */ name,
    /** @type {string} */ oldValue,
    /** @type {string} */ newValue,
  ) {
    if (oldValue === newValue) return;

    if (name === 'time') {
      this.#updateTarget(newValue);
      this.#restart();
    } else if (name === 'format') {
      this.#updateFormat(newValue);
      this.#restart();
    }
  }

  #start() {
    if (!some(this.#targetTimestamp)) {
      this.textContent = '';
      this.#lastRendered = undefined;
      return;
    }

    this.#runLoop();
  }

  #restart() {
    this.#stop();
    this.#start();
  }

  #stop() {
    if (some(this.#timerId)) {
      clearTimeout(this.#timerId);
      this.#timerId = undefined;
    }

    if (some(this.#rafId)) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = undefined;
    }
  }

  #runLoop() {
    this.#stop();

    const tick = () => {
      if (!this.isConnected || !some(this.#targetTimestamp)) {
        this.#stop();
        return;
      }

      this.#render();

      const remaining = this.#targetTimestamp - Date.now();
      if (remaining <= 0) {
        this.#render(0);
        this.#stop();
        return;
      }

      if (this.#useAnimationFrame) {
        this.#rafId = requestAnimationFrame(tick);
        return;
      }

      const delay = this.#computeDelay(remaining);
      this.#timerId = window.setTimeout(tick, delay);
    };

    tick();
  }

  #computeDelay(/** @type {number} */ remaining) {
    if (this.#interval >= Milliseconds.Second) {
      const mod = remaining % this.#interval;
      return mod > 0 ? mod : this.#interval;
    }

    return this.#interval;
  }

  #render(/** @type {number | undefined} */ forceValue = undefined) {
    if (!some(this.#targetTimestamp)) return;

    const msRemaining =
      typeof forceValue === 'number' ? forceValue : (
        Math.max(0, this.#targetTimestamp - Date.now())
      );
    const text = formatDuration(msRemaining, this.#format);

    if (text !== this.#lastRendered) {
      this.textContent = text;
      this.#lastRendered = text;
    }
  }

  #updateTarget(/** @type {string} */ value) {
    const date = parseTime(value);
    this.#targetTimestamp = date?.getTime();
  }

  #updateFormat(/** @type {string} */ value) {
    const format = value?.trim() || 'hh:mm:ss';
    this.#format = format;

    const fractionMatches = format.match(/S+/g);
    this.#useAnimationFrame = Boolean(fractionMatches);

    if (fractionMatches?.length) {
      const maxDigits = Math.max(
        ...fractionMatches.map((match) => Math.min(match.length, 3)),
      );
      const step = Math.max(4, Math.round(1000 / 10 ** maxDigits));
      this.#interval = step;
    } else if (/[s]/i.test(format)) {
      this.#interval = Milliseconds.Second;
    } else if (/[m]/i.test(format)) {
      this.#interval = Milliseconds.Minute;
    } else if (/[h]/i.test(format)) {
      this.#interval = Milliseconds.Hour;
    } else {
      this.#interval = Milliseconds.Day;
    }
  }
}

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

if (!customElements.get('x-countdown'))
  customElements.define('x-countdown', XCountdown);
