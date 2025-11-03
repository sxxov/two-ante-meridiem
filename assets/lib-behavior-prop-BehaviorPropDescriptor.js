import { PipeSignal } from './lib-signal-PipeSignal.js';
import { BehaviorPropDisplay } from './lib-behavior-prop-BehaviorPropDisplay.js';
import { getBehaviorPropSerializedValue } from './lib-behavior-serialization-getBehaviorPropSerializedValue.js';
import { getBehaviorPropDeserializedValue } from './lib-behavior-serialization-getBehaviorPropDeserializedValue.js';
import { BehaviorPropSerialization } from './lib-behavior-prop-BehaviorPropSerialization.js';
import { BehaviorPropDeserialization } from './lib-behavior-prop-BehaviorPropDeserialization.js';
/** @import {BehaviorPropKind} from './lib-behavior-prop-BehaviorPropKind.js' */
/** @import {BehaviorPropKindValue} from './lib-behavior-prop-BehaviorPropKindValue.js' */
/** @import {Starter} from './lib-signal.js' */

/** @typedef {string & {}} DiscriminateString */
/** @typedef {number & {}} DiscriminateNumber */

const brand = '\0BehaviorPropDescriptor';

/**
 * @template {BehaviorPropKind} [Kind=BehaviorPropKind] Default is
 *   `BehaviorPropKind`
 * @template {BehaviorPropKindValue<Kind>} [T=BehaviorPropKindValue<Kind>]
 *   Default is `BehaviorPropKindValue<Kind>`
 * @extends {PipeSignal<T, T>}
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
   * @template const R
   * @returns {BehaviorPropDescriptor<Kind, R>}
   */
  through(/** @type {(v: T) => T | R} */ mapper) {
    const { pipe } = this;
    this.pipe = /** @type {any} */ (
      (/** @type {any} */ it) => mapper(/** @type {any} */ (pipe(it)))
    );
    this.trigger();
    return /** @type {any} */ (this);
  }

  /** @internal @type {BehaviorPropSerialization} */
  serializeMode = BehaviorPropSerialization.Attribute;
  /** @internal */
  serializeMapper = (/** @type {T} */ v) =>
    getBehaviorPropSerializedValue(this.kind, v);

  serialize(/** @type {BehaviorPropSerialization} */ serialization) {
    this.serializeMode = serialization;
    return this;
  }
  serializer(/** @type {typeof this.serializeMapper} */ serializer) {
    this.serializeMapper = serializer;
    return this;
  }

  /** @internal @type {BehaviorPropDeserialization} */
  deserializeMode = BehaviorPropDeserialization.Attribute;
  /** @internal */
  deserializeMapper = (/** @type {string | undefined} */ v) =>
    /** @type {T | undefined} */ (
      getBehaviorPropDeserializedValue(this.kind, v)
    );

  deserialize(/** @type {BehaviorPropDeserialization} */ deserialization) {
    this.deserializeMode = deserialization;
    return this;
  }
  deserializer(/** @type {typeof this.deserializeMapper} */ deserializer) {
    this.deserializeMapper = deserializer;
    return this;
  }

  /**
   * @template {T} R
   * @returns {BehaviorPropDescriptor<Kind, Exclude<T, undefined | null> | R>}
   */
  default(/** @type {R} */ value) {
    return /** @type {any} */ (this.through((it) => it ?? value));
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
    return this.backing()
      .serialize(BehaviorPropSerialization.None)
      .deserialize(BehaviorPropDeserialization.None);
  }
}

/** @returns {value is BehaviorPropDescriptor} */
export function isBehaviorPropDescriptor(/** @type {any} */ value) {
  return brand in value;
}
