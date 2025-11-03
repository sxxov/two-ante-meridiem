import { bin, subscribe } from './lib-signal.js';
import { behavior, registerGlobalBehaviors, t } from './lib-behavior.js';
import { route } from './lib-routing-route.js';
import { some } from './lib-type-some.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { getTrailingUnslashed } from './lib-path-getTrailingUnslashed.js';

export const HrefMatchesPageBehavior = behavior(
  'href-matches-page',
  class {
    params = t.string.choice('exact').choice('name').default('exact');
  },
  (element, { params }, {}) => {
    const _ = bin();

    _._ = subscribe({ route, params }, ({ $params }) => {
      const anchor = getAnchor(element);
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!some(href)) return;

      const url = new URL(href, location.href);
      setAttributes(element, {
        'data-href-matches-page-matched': doesUrlMatchPage(
          url,
          $params === 'exact',
        ),
      });
    });

    return _;
  },
);

function getAnchor(/** @type {HTMLElement} */ el) {
  if (el.tagName === 'A') return el;

  const ancestor = el.closest('a');
  if (ancestor instanceof HTMLAnchorElement) return ancestor;

  const child = el.querySelector('a');
  if (child instanceof HTMLAnchorElement) return child;
}

function doesUrlMatchPage(
  /** @type {URL} */ url,
  /** @type {boolean} */ matchSearchParamsValue,
) {
  const originMatches = url.origin === location.origin;
  if (!originMatches) return false;

  const pathnameMatches =
    getTrailingUnslashed(url.pathname) ===
    getTrailingUnslashed(location.pathname);
  if (!pathnameMatches) return false;

  const locationSearchParams = new URLSearchParams(location.search);
  const searchParamsMatches =
    url.searchParams.size <= 0 ||
    [...url.searchParams].some(
      ([key, value]) =>
        locationSearchParams.has(key) &&
        (!matchSearchParamsValue || locationSearchParams.get(key) === value),
    );
  if (!searchParamsMatches) return false;

  const hashMatches = !url.hash || url.hash === location.hash;
  if (!hashMatches) return false;

  return true;
}

registerGlobalBehaviors(HrefMatchesPageBehavior);
