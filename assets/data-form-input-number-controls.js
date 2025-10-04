import { Signal } from './lib-signal.js';
import { behavior, registerGlobalBehaviors } from './lib-behavior.js';
import { FormInputNumberControlsIncrementBehavior } from './data-form-input-number-controls-increment.js';
import { FormInputNumberControlsDecrementBehavior } from './data-form-input-number-controls-decrement.js';

export const FormInputNumberControlsBehavior = behavior(
  'form-input-number-controls',
  class {
    input = new Signal(/** @type {HTMLInputElement | undefined} */ (undefined));
  },
  (element, { input }, { registerLocalBehaviors }) => {
    registerLocalBehaviors(
      FormInputNumberControlsIncrementBehavior,
      FormInputNumberControlsDecrementBehavior,
    );

    // TODO: this should probably be another behaviour, but it's late & i'm tired
    input.set(
      /** @type {HTMLInputElement | undefined} */ (
        element.querySelector('input[type="number"]')
      ),
    );
  },
);

queueMicrotask(() => {
  registerGlobalBehaviors(FormInputNumberControlsBehavior);
});
