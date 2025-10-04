import { type BehaviorProps } from './lib-behavior-prop-BehaviorProps.js';
import { type BehaviorFactoryContext } from './lib-behavior-factory-BehaviorFactoryContext.js';
import { type BehaviorInvalidator } from './lib-behavior-factory-BehaviorInvalidator.js';

export type BehaviorFactory<Props extends BehaviorProps = BehaviorProps> = (
  element: HTMLElement,
  props: Props,
  context: BehaviorFactoryContext<Props>,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => void | BehaviorInvalidator | Promise<void | BehaviorInvalidator>;
