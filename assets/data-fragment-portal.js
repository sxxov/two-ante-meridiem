import { bin, Signal, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';
import { some } from './lib-type-some.js';

export const FragmentPortalBehavior = behavior(
  'fragment-portal',
  class {
    content = new Signal(
      /** @type {DocumentFragment | Element | undefined} */ (undefined),
    );
  },
  (element, { content }, { getContext }) =>
    subscribe({ fragment: getContext(FragmentBehavior) }, ({ $fragment }) => {
      if (!$fragment) return;

      const { url, selector, version, status } = $fragment;

      const _ = bin();
      const parser = new DOMParser();

      _._ = subscribe(
        { url, selector, version },
        async ({ $url, $selector = ':root', $version }) => {
          if (!some($url)) return;
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
            const elements = doc.querySelectorAll($selector);
            if (elements.length > 1) {
              const fragment = document.createDocumentFragment();
              for (const element of elements) fragment.append(element);
              content.set(fragment ?? undefined);
            } else if (elements.length === 1) {
              content.set(elements[0]);
            } else {
              content.set(undefined);
            }

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
