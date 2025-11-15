import { bin, Signal, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { some } from './lib-type-some.js';
import { PullTargetBehavior } from './data-pull-target.js';
import { PullInputParameterBehavior } from './data-pull-input-parameter.js';
import { PullInputOptionBehavior } from './data-pull-input-option.js';
import { TaskSignal } from './lib-signal-TaskSignal.js';

export const PullBehavior = behavior(
  'pull',
  class {
    url = t.string;
    section = t.string;

    parameters = new Signal(new URLSearchParams());
    nodes = new Signal(
      new /** @type {typeof Map<HTMLElement, { selector: string }>} */ (Map)(),
    );

    version = t.number.backing().default(-1);
  },
  (
    element,
    { url, section, parameters, nodes, version },
    { registerLocalBehaviors },
  ) => {
    registerLocalBehaviors(
      PullTargetBehavior,
      PullInputOptionBehavior,
      PullInputParameterBehavior,
    );

    const _ = bin();

    const controller = new AbortController();
    const { signal } = controller;
    _._ = () => { controller.abort(); };

    const propagateParameters = () => {
      const $parameters = parameters.get();
      const $url = url.get();
      if (!some($url)) return;

      const targetUrl = new URL($url, location.href);
      const locationUrl = new URL(location.href);
      if (
        locationUrl.origin !== targetUrl.origin ||
        locationUrl.pathname !== targetUrl.pathname
      )
        return;

      const { searchParams } = locationUrl;

      for (const [key, value] of $parameters) searchParams.set(key, value);

      history.replaceState(undefined, '', locationUrl.href);
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

    _._ = subscribe({ version: new TaskSignal(-1).in(version) }, () => {
      propagateParameters();
      void pull();
    });

    return _;
  },
);

queueMicrotask(() => {
  registerGlobalBehaviors(PullBehavior);
});
