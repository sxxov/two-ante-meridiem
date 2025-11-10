import { queueMicrotask } from './lib-dom-queueMicrotask.js';
import { Signal } from './lib-signal.js';

/**
 * @augments {Signal<T>}
 * @template T
 */
export class TaskSignal extends Signal {
  /** @type {T | undefined} */
  #setPrevious;
  #setScheduled = false;
  /** @override */
  set(/** @type {T} */ value) {
    if (!this.#setScheduled) {
      this.#setScheduled = true;
      this.#setPrevious = this.get();
    }

    this.value = value;

    if (!this.#setScheduled)
      queueMicrotask(() => {
        this.#setScheduled = false;

        const same = /** @type {typeof TaskSignal} */ (
          this.constructor
        ).compare(this.#setPrevious, this.get());
        this.#setPrevious = undefined;

        if (same) return;
        super.trigger();
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
