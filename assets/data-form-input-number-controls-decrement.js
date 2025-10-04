import { bin, subscribe } from './lib-signal.js';
import { FormInputNumberControlsBehavior } from './data-form-input-number-controls.js';
import { behavior } from './lib-behavior.js';

export const FormInputNumberControlsDecrementBehavior = behavior(
  'form-input-number-controls-decrement',
  class {},
  (element, {}, { getContext }) =>
    subscribe(
      { formInputNumberControls: getContext(FormInputNumberControlsBehavior) },
      ({ $formInputNumberControls }) => {
        if (!$formInputNumberControls) return;

        const { input } = $formInputNumberControls;

        return subscribe({ input }, ({ $input }) => {
          if (!$input) return;

          const _ = bin();

          const step = parseFloat($input.step) || 1;
          const min = $input.min === '' ? -Infinity : parseFloat($input.min);
          const max = $input.max === '' ? Infinity : parseFloat($input.max);

          const controller = new AbortController();
          const { signal } = controller;
          _._ = () => { controller.abort(); };

          element.addEventListener(
            'click',
            () => {
              let value = parseFloat($input.value) || 0;
              value -= step;
              if (value > max) value = max;
              if (value < min) value = min;
              $input.value = `${value}`;
            },
            { signal },
          );

          return _;
        });
      },
    ),
);
