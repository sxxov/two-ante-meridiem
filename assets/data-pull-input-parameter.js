import { PullBehavior } from './data-pull.js';
import { behavior, t } from './lib-behavior.js';
import { bin, subscribe } from './lib-signal.js';
import { some } from './lib-type-some.js';

export const PullInputParameterBehavior = behavior(
  'pull-input-parameter',
  class {
    '' = t.string;
  },
  (element, { '': parameter }, { getContext }) =>
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

      const entry = parameter.derive((it) => it?.split('=') ?? []);
      const name = entry.derive(([name]) => name);
      const value = entry.derive(([, value]) => value);

      _._ = subscribe({ name, value, pullVersion }, ({ $name, $value }) => {
        if (!some($value) || !some($name)) return;

        const active = (() => {
          const { form } = element;
          if (!form) return true;

          const formData = new FormData(form);
          const active = formData.getAll(element.name).includes(element.value);

          return active;
        })();
        if (!active) return;

        /** @type {string | undefined} */
        let previousValue;
        const nextValue = $value;
        parameters.update((it) => {
          const currentValue = it.get($name) ?? undefined;
          previousValue = currentValue;
          if (currentValue === nextValue) return it;

          it.set($name, nextValue);
          parameters.trigger();
          return it;
        });
        return () => {
          parameters.update((it) => {
            const currentValue = it.get($name) ?? undefined;
            if (currentValue !== nextValue) return it;
            if (previousValue === currentValue) return it;

            if (some(previousValue)) {
              it.set($name, previousValue);
              previousValue = undefined;
            } else it.delete($name);

            parameters.trigger();
            return it;
          });
        };
      });

      return _;
    }),
);
