import { PipeSignal } from './lib-signal-PipeSignal.js';
import { BehaviorPropDisplay } from './lib-behavior-prop-BehaviorPropDisplay.js';
import { BehaviorPropSerialization } from './lib-behavior-prop-BehaviorPropSerialization.js';
/** @import {BehaviorPropKind} from './lib-behavior-prop-BehaviorPropKind.js' */
/** @import {BehaviorPropKindValue} from './lib-behavior-prop-BehaviorPropKindValue.js' */
/** @import {Starter} from './lib-signal.js' */

/** @typedef {string & {}} DiscriminateString */
/** @typedef {number & {}} DiscriminateNumber */

const brand = '\0BehaviorPropDescriptor';

/**
 * @augments {PipeSignal<T, T>}
 * @template {BehaviorPropKind} [Kind=BehaviorPropKind] Default is
 *   `BehaviorPropKind`
 * @template {BehaviorPropKindValue<Kind>} [T=BehaviorPropKindValue<Kind>]
 *   Default is `BehaviorPropKindValue<Kind>`
 */
export class BehaviorPropDescriptor extends PipeSignal {
  /**
   * A very rudimentary tag system (on purpose) that survives cross-window
   * checks (which `instanceof` fails). We need this due to iframe isolation in
   * Gutenberg
   *
   * @private
   */
  [brand] = true;

  /** @type {T[]} */
  completions = [];

  /** @type {BehaviorPropDisplay} */
  display = BehaviorPropDisplay.Default;

  /** @type {BehaviorPropSerialization} */
  serialization = BehaviorPropSerialization.Serialized;

  constructor(
    /** @type {Kind} */ kind,
    /** @type {T} */ initialValue,
    /** @type {Starter<BehaviorPropDescriptor<T>> | undefined} */ onStart = undefined,
  ) {
    super(
      initialValue,
      (it) => /** @type {T} */ (it),
      /** @type {any} */ (onStart),
    );
    this.kind = kind;
  }

  /**
   * @template R
   * @returns {BehaviorPropDescriptor<Kind, R>}
   */
  through(/** @type {(v: T) => R & T} */ mapper) {
    const { pipe } = this;
    this.pipe = /** @type {any} */ (
      (/** @type {any} */ it) => mapper(/** @type {any} */ (pipe(it)))
    );
    super.update((it) => it);
    return /** @type {any} */ (this);
  }

  /**
   * @template {T} R
   * @returns {BehaviorPropDescriptor<Kind, NonNullable<T> | R>}
   */
  default(/** @type {R} */ value) {
    return this.through((it) => it ?? value);
  }

  /**
   * @template {T} Choice
   * @returns {BehaviorPropDescriptor<Kind, T | Choice>}
   */
  choice(/** @type {Choice} */ value) {
    this.completions.push(value);
    return /** @type {any} */ (this);
  }

  backing() {
    this.display = BehaviorPropDisplay.Hidden;
    return this;
  }

  transient() {
    this.display = BehaviorPropDisplay.Hidden;
    this.serialization = BehaviorPropSerialization.Transient;
    return this;
  }
}

/** @returns {value is BehaviorPropDescriptor} */
export function isBehaviorPropDescriptor(/** @type {any} */ value) {
  return brand in value;
}
