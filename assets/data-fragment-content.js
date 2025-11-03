import { bin, Signal, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';
import { some } from './lib-type-some.js';

export const FragmentContentBehavior = behavior(
  'fragment-content',
  class {
    content = new Signal(/** @type {Element | undefined} */ (undefined));
  },
  (element, { content }, { getContext }) =>
    subscribe({ fragment: getContext(FragmentBehavior) }, ({ $fragment }) => {
      if (!$fragment) return;

      const { url, selector, version, status, container } = $fragment;

      const _ = bin();
      const parser = new DOMParser();

      {
        const $container = container.get();
        container.set(element);
        _._ = () => {
          if (container.get() === element) container.set($container);
        };
      }

      _._ = subscribe(
        { url, selector, version },
        async ({ $url, $selector, $version }) => {
          if (!some($url) || !some($selector)) return;
          if ($version < 0) return;

          const _ = bin();
          const controller = new AbortController();
          const { signal } = controller;
          _._ = () => { controller.abort(); };

          try {
            status.set('loading');

            const response = await fetch($url, { signal });
            if (!response.ok)
              throw new Error(`${response.statusText} (${response.status})`);

            const text = await response.text();
            const doc = parser.parseFromString(text, 'text/html');
            const fragment = doc.querySelector($selector);

            content.set(fragment ?? undefined);
            status.set('ready');
          } catch (error) {
            status.set('error');
            console.error(error);
          }
        },
      );

      _._ = subscribe({ content }, ({ $content }) => {
        if (!$content) return;

        element.replaceChildren($content);
      });

      return _;
    }),
);
