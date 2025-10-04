import { type BehaviorConfigurator } from './lib-behavior-factory-BehaviorConfigurator.js';
import { type BehaviorFactory } from './lib-behavior-factory-BehaviorFactory.js';

export type BehaviorRepresentation<
  Name extends string = string,
  Configurator extends BehaviorConfigurator = BehaviorConfigurator<{}>,
  Factory extends BehaviorFactory<InstanceType<Configurator>> = BehaviorFactory<
    InstanceType<Configurator>
  >,
> = {
  name: Name;
  configurator: Configurator;
  factory: Factory;
};
