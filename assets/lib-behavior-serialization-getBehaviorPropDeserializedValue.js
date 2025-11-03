import { BehaviorPropKind } from './lib-behavior-prop-BehaviorPropKind.js';
import { some } from './lib-type-some.js';

export function getBehaviorPropDeserializedValue(
  /** @type {BehaviorPropKind} */ kind,
  /** @type {string | undefined} */ serializedValue,
) {
  if (!some(serializedValue)) return;

  switch (kind) {
    case BehaviorPropKind.Boolean:
      return serializedValue !== 'false';
    case BehaviorPropKind.Number:
      return Number(serializedValue);
    case BehaviorPropKind.String:
      return serializedValue;
  }
}
