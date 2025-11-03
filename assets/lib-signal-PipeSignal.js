import { Signal } from './lib-signal.js';
/** @import {Starter, WritableSignal} from './lib-signal.js' */

/**
 * @template T
 * @template R
 * @typedef {(value: T) => R} Pipe
 */

/**
 * @template T
 * @template R
 * @extends {Signal<T>}
 */
export class PipeSignal extends Signal {
  /**
   * @type {Pipe<T, R>}
   * @protected
   */
  pipe;

  /**
   * @type {R}
   * @protected
   */
  pipedValue;

  constructor(
    /** @type {T} */ initialValue,
    /** @type {Pipe<T, R>} */ onPipe,
    /** @type {Starter<PipeSignal<T, R>> | undefined} */ onStart = undefined,
  ) {
    // @ts-expect-error since we fuck up `get()`, we have to ignore here too
    super(initialValue, /** @type {Starter<Signal<T>>} */ (onStart));
    this.pipe = onPipe;
    this.pipedValue = this.pipe(initialValue);
  }

  /** @override */
  trigger() {
    this.pipedValue = this.pipe(super.get());
    super.trigger();
  }

  /** @override */
  // @ts-expect-error we have to do this since we can't change the return type of a method
  get() {
    return /** @type {R} */ (this.pipedValue);
  }

  /** @override */
  update(/** @type {(v: T) => T} */ mapper) {
    this.set(mapper(super.get()));
  }
}
