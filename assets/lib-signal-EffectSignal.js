import { Signal } from './lib-signal.js';
/** @import {Starter} from './lib-signal.js' */

/**
 * @template T
 * @typedef {(value: T) => void} Effect
 */

/**
 * @augments {Signal<T>}
 * @template T
 */
export class EffectSignal extends Signal {
  /**
   * @type {Effect<T> | undefined}
   * @protected
   */
  effect;

  /** @private */
  effectScheduled = false;

  constructor(
    /** @type {T} */ initialValue,
    /** @type {Effect<T> | undefined} */ onEffect = undefined,
    /** @type {Starter<EffectSignal<T>> | undefined} */ onStart = undefined,
  ) {
    super(initialValue, /** @type {Starter<Signal<T>>} */ (onStart));
    this.effect = onEffect;
  }

  /** @override */
  set(/** @type {T} */ value, effectful = true) {
    this.effectScheduled = effectful;
    super.set(value);
    this.effectScheduled = false;
  }

  /** @override */
  trigger(effectful = this.effectScheduled) {
    super.trigger();
    if (effectful) this.effect?.(this.get());
    this.effectScheduled = false;
  }
}
