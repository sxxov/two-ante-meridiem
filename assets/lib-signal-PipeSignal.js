import { Signal } from './lib-signal.js';
/** @import {Starter, WritableSignal} from './lib-signal.js' */

/**
 * @template T
 * @template R
 * @typedef {(value: T) => R} Pipe
 */

/**
 * @augments {Signal<R>}
 * @template T
 * @template R
 */
export class PipeSignal extends Signal {
  /**
   * @type {Pipe<T, R>}
   * @protected
   */
  pipe;

  constructor(
    /** @type {T} */ initialValue,
    /** @type {Pipe<T, R>} */ onPipe,
    /** @type {Starter<PipeSignal<T, R>> | undefined} */ onStart = undefined,
  ) {
    super(
      onPipe(initialValue),
      // @ts-expect-error pretend this is sound
      onStart,
    );
    this.pipe = onPipe;
  }

  /** @override */
  // @ts-expect-error pretend this is sound, there is not
  // a better way to type a method that doesn't match the
  // base class signature
  set(/** @type {T} */ value) {
    super.set(this.pipe(value));
  }
}
