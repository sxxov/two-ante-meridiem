import { type Signal } from './lib-signal.js';
import { type BehaviorProps } from './lib-behavior-prop-BehaviorProps.js';
import { type BehaviorRepresentation } from './lib-behavior-factory-BehaviorRepresentation.js';

export type BehaviorElementContext = {
  behaviorToProps: Signal<Map<BehaviorRepresentation, BehaviorProps>>;
  registeredLocalBehaviors: Signal<Set<BehaviorRepresentation>>;
};
