import { BehaviorPropKind } from './lib-behavior-prop-BehaviorPropKind.js';
import { some } from './lib-functional-some.js';
import { cast } from './lib-type-cast.js';

export function getBehaviorPropSerializedValue(
  /** @type {BehaviorPropKind} */ kind,
  /** @type {unknown} */ value,
) {
  if (!some(value)) return;

  switch (kind) {
    case BehaviorPropKind.Boolean:
      /** @type {typeof cast<boolean>} */ (cast)(value);
      return value ? '' : undefined;
    case BehaviorPropKind.Number:
      /** @type {typeof cast<number>} */ (cast)(value);
      return `${value}`;
    case BehaviorPropKind.String:
      /** @type {typeof cast<string>} */ (cast)(value);
      return value;
  }
}
