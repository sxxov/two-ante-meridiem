import { type BehaviorPropDescriptor } from './lib-behavior-prop-BehaviorPropDescriptor.js';
import { type BehaviorProps } from './lib-behavior-prop-BehaviorProps.js';

type IsNullish<T> = Extract<T, null | undefined> extends never ? false : true;

export type BehaviorPropsDescriptorValues<Props extends BehaviorProps> = {
  [K in keyof Props as Props[K] extends (
    BehaviorPropDescriptor<any, infer Result>
  ) ?
    IsNullish<Result> extends true ?
      K
    : never
  : never]?: Props[K] extends BehaviorPropDescriptor<any, infer Result> ? Result
  : never;
} & {
  [K in keyof Props as Props[K] extends (
    BehaviorPropDescriptor<any, infer Result>
  ) ?
    IsNullish<Result> extends true ?
      never
    : K
  : never]?: Props[K] extends BehaviorPropDescriptor<any, infer Result> ? Result
  : never;
};
