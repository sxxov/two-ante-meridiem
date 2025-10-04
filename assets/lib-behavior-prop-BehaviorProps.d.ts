import { type BehaviorPropDescriptor } from './lib-behavior-prop-BehaviorPropDescriptor.js';

export type BehaviorProps = Record<
  string,
  {} | undefined | null | BehaviorPropDescriptor
>;
