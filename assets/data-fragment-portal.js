import { bin, subscribe } from './lib-signal.js';
import { behavior } from './lib-behavior.js';
import { FragmentBehavior } from './data-fragment.js';
import { some } from './lib-type-some.js';
import { TaskSignal } from './lib-signal-TaskSignal.js';

export const FragmentPortalBehavior = behavior(
  'fragment-portal',
  class {
    html = new TaskSignal(/** @type {string | undefined} */ (undefined));
    children = new TaskSignal(
      /** @type {DocumentFragment | Element | undefined} */ (undefined),
    );
  },
  (element, { children, html }, { getContext }) =>
    subscribe({ fragment: getContext(FragmentBehavior) }, ({ $fragment }) => {
      if (!$fragment) return;

      const { url, selector, version, status } = $fragment;

      const _ = bin();
      const parser = new DOMParser();

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
            if (signal.aborted) throw new Error();

            const text = await response.text();
            if (signal.aborted) throw new Error();

            html.set(text);
            status.set('ready');
          } catch (error) {
            if (signal.aborted) return _;

            status.set('error');
            // eslint-disable-next-line no-console
            console.error(error);
          }

          return _;
        },
      );

      _._ = subscribe({ html, selector }, ({ $html, $selector }) => {
        if (!some($html) || !some($selector)) return;

        const _ = bin();

        const doc = parser.parseFromString($html, 'text/html');
        const elements = doc.querySelectorAll($selector);
        if (elements.length > 1) {
          const fragment = document.createDocumentFragment();
          for (const element of elements) fragment.append(element);
          children.set(fragment ?? undefined);
        } else if (elements.length === 1) {
          children.set(elements[0]);
        } else {
          children.set(undefined);
        }

        return _;
      });

      const inner = children.derive((it) => {
        if (!it) return '';

        if (it instanceof DocumentFragment) {
          let string = '';
          for (const node of it.childNodes) {
            if (node instanceof Element) string += node.outerHTML;
            else if (node instanceof Text) string += node.textContent;
          }
          return string;
        }

        if (it instanceof Element) return it.outerHTML;

        return '';
      });
      _._ = subscribe({ inner }, ({ $inner }) => {
        if (!$inner) return;

        element.innerHTML = $inner;
      });

      return _;
    }),
);
