import { bin, subscribe } from './lib-signal.js';
import { behavior, t } from './lib-behavior.js';
import { PullBehavior } from './data-pull.js';
import { some } from './lib-type-some.js';

const optionsParameterName = 'option_values';

export const PullInputOptionBehavior = behavior(
  'pull-input-option',
  class {
    '' = t.string;
  },
  (element, { '': option }, { getContext }) =>
    subscribe({ pull: getContext(PullBehavior) }, ({ $pull }) => {
      if (!(element instanceof HTMLInputElement) || !$pull) return;

      const _ = bin();
      const controller = new AbortController();
      const { signal } = controller;
      _._ = () => { controller.abort(); };

      const { parameters, version: pullVersion } = $pull;

      element.addEventListener(
        'change',
        () => {
          pullVersion.update((it) => it + 1);
        },
        { signal },
      );

      _._ = subscribe({ option, pullVersion }, ({ $option }) => {
        if (!some($option)) return;

        const active = (() => {
          const { form } = element;
          if (!form) return true;

          const formData = new FormData(form);
          const active = formData.getAll(element.name).includes(element.value);

          return active;
        })();
        if (!active) return;

        parameters.update((it) => {
          const currentOptions = it.get(optionsParameterName) ?? undefined;
          const nextOptions = (() => {
            const it = new Set(currentOptions?.split(',') ?? []);
            it.add($option);
            return [...it].join(',');
          })();
          if (nextOptions === currentOptions) return it;

          it.set(optionsParameterName, nextOptions);

          parameters.trigger();
          return it;
        });
        return () => {
          parameters.update((it) => {
            const currentOptions = it.get(optionsParameterName) ?? undefined;
            const nextOptions = (() => {
              const it = new Set(currentOptions?.split(',') ?? []);
              it.delete($option);
              return [...it].join(',');
            })();
            if (nextOptions === currentOptions) return it;

            if (nextOptions) it.set(optionsParameterName, nextOptions);
            else it.delete(optionsParameterName);

            parameters.trigger();
            return it;
          });
        };
      });

      return _;
    }),
);
