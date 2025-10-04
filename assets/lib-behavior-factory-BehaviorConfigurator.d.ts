import { type BehaviorProps } from './lib-behavior-prop-BehaviorProps.js';

export type BehaviorConfigurator<Props extends BehaviorProps = BehaviorProps> =
  new () => Props;
