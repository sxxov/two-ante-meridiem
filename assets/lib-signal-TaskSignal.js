import { queueMicrotask } from './lib-dom-queueMicrotask.js';
import { Signal } from './lib-signal.js';

/**
 * @augments {Signal<T>}
 * @template T
 */
export class TaskSignal extends Signal {
  #setScheduled = false;
  /** @override */
  set(/** @type {T} */ value) {
    if (this.#setScheduled) return;
    this.#setScheduled = true;

    queueMicrotask(() => {
      this.#setScheduled = false;
      super.set(value);
    });
  }

  #triggerScheduled = false;
  /** @override */
  trigger() {
    if (this.#triggerScheduled) return;
    this.#triggerScheduled = true;

    queueMicrotask(() => {
      this.#triggerScheduled = false;
      super.trigger();
    });
  }
}
