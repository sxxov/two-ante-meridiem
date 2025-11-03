import { type BehaviorRepresentation } from './lib-behavior-factory-BehaviorRepresentation.js';

export type BehaviorInstance<
  Behavior extends BehaviorRepresentation<string, any, any>,
> = InstanceType<Behavior['configurator']>;
