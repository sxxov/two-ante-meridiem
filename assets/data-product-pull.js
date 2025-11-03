import { bin, Signal } from './lib-signal.js';
import {
  behavior,
  hasAttachedBehavior,
  registerGlobalBehaviors,
  t,
} from './lib-behavior.js';
import { some } from './lib-type-some.js';
import { ProductPullNodeBehavior } from './data-product-pull-node.js';
import { ProductPullOptionBehavior } from './data-product-pull-option.js';

export const ProductPullBehavior = behavior(
  'product-pull',
  class {
    url = t.string;
    section = t.string;
    parameters = new Signal(new URLSearchParams());
    nodes = new Signal(
      new /** @type {typeof Map<HTMLElement, { selector: string }>} */ (Map)(),
    );
  },
  (
    element,
    { url, section, parameters, nodes },
    { registerLocalBehaviors },
  ) => {
    registerLocalBehaviors(ProductPullNodeBehavior, ProductPullOptionBehavior);

    const _ = bin();

    const controller = new AbortController();
    const { signal } = controller;
    _._ = () => { controller.abort(); };

    const propagateParameters = () => {
      const $parameters = parameters.get();
      const url = new URL(location.href);
      const { searchParams } = url;

      for (const [key, value] of $parameters) searchParams.set(key, value);

      history.replaceState(undefined, '', url.href);
    };

    const pullHtml = async () => {
      const $url = url.get();
      const $section = section.get();
      const $parameters = parameters.get();

      if (!some($url) || !some($section)) return;

      try {
        const qualifiedUrl = new URL($url, location.href);
        qualifiedUrl.search = $parameters.toString();
        qualifiedUrl.searchParams.set('section_id', $section);

        const response = await fetch(qualifiedUrl, { signal });
        if (!response.ok)
          throw new Error(`${response.statusText} (${response.status})`);

        const text = await response.text();

        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    const pull = async () => {
      const html = await pullHtml();
      if (!(html instanceof HTMLDocument)) return;

      const $nodes = nodes.get();
      for (const [node, { selector }] of $nodes) {
        const replacement = html.querySelector(selector);
        if (replacement instanceof HTMLElement) {
          node.replaceWith(replacement);
          $nodes.delete(node);
        }
      }
    };

    element.addEventListener(
      'change',
      (event) => {
        const { target } = event;
        if (
          !(target instanceof HTMLElement) ||
          !hasAttachedBehavior(target, ProductPullOptionBehavior)
        )
          return;

        propagateParameters();
        void pull();
      },
      { signal },
    );

    return _;
  },
);

queueMicrotask(() => {
  registerGlobalBehaviors(ProductPullBehavior);
});
