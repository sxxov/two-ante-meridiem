import { type BehaviorPropKind } from './lib-behavior-prop-BehaviorPropKind.js';

export type BehaviorPropKindValue<T extends BehaviorPropKind> =
  T extends typeof BehaviorPropKind.Boolean ? boolean | undefined
  : T extends typeof BehaviorPropKind.Number ? (number & {}) | undefined
  : T extends typeof BehaviorPropKind.String ? (string & {}) | undefined
  : never;
