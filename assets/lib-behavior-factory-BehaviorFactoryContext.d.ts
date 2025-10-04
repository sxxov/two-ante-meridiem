import { type ReadableSignal } from './lib-signal.js';
import { type BehaviorRepresentation } from './lib-behavior-factory-BehaviorRepresentation.js';
import { type BehaviorProps } from './lib-behavior-prop-BehaviorProps.js';

export type BehaviorFactoryContext<Props extends BehaviorProps> = {
  registerLocalBehaviors: (
    ...behaviors: BehaviorRepresentation<string, any, any>[]
  ) => void;
  getContext: <Behavior extends BehaviorRepresentation<string, any, any>>(
    behavior: Behavior,
  ) => ReadableSignal<InstanceType<Behavior['configurator']> | undefined>;
};
