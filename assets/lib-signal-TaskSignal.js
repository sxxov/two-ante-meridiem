import { Signal } from './lib-signal.js';

/**
 * @augments {Signal<T>}
 * @template T
 */
export class TaskSignal extends Signal {
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
