import { bin, Signal, subscribe } from './lib-signal.js';
/** @import {EmblaCarouselType, EmblaPluginType} from 'embla-carousel' */

export default function EmblaCarouselHash({} = {}) {
  const _ = bin();

  const api = new Signal(
    /** @type {EmblaCarouselType | undefined} */ (undefined),
  );
  _._ = subscribe({ api }, ({ $api }) => {
    if (!$api) return;

    const updateHashWithSelected = () => {
      const nodes = $api.slideNodes();
      const selectedNode = nodes[$api.selectedScrollSnap()];

      if (!(selectedNode instanceof Element)) return;
      hash.set(selectedNode.id);
    };
    $api.on('select', updateHashWithSelected);
    return () => {
      $api.off('select', updateHashWithSelected);
    };
  });
  const hash = new Signal(location.hash.slice(1), ({ set }) =>
    subscribe({ api }, ({ $api }) => {
      if (!$api) return;

      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener(
        'hashchange',
        () => {
          set(location.hash.slice(1));
        },
        { signal },
      );
      return () => {
        controller.abort();
      };
    }));
  _._ = subscribe({ hash }, ({ $hash }) => {
    const url = new URL(location.href);
    url.hash = $hash;
    history.replaceState(undefined, '', url);
  });
  _._ = subscribe({ api, hash }, ({ $api, $hash }) => {
    if (!$api) return;

    const nodes = $api.slideNodes();
    const index = nodes.findIndex((node) => node.id === $hash);
    const scrollSnap = $api.scrollSnapList()[index];
    if (index < 0 || $api.selectedScrollSnap() === scrollSnap) return;

    $api.scrollTo(index);
  });

  return /** @type {const} @satisfies {EmblaPluginType} */ ({
    name: 'hash',
    options: {},
    init(carousel) {
      api.set(carousel);
    },
    destroy() {
      _.dispose();
      api.destroy();
    },
  });
}
