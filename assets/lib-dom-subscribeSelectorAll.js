/* eslint-disable complexity */

import { coerceInvalidator, Signal, subscribe } from './lib-signal.js';

/** @typedef {() => void} SelectorInvalidator */
/**
 * @typedef {(
 *   element: Element,
 * ) => void | SelectorInvalidator | Promise<void | SelectorInvalidator>} SelectorSubscriber
 */

/**
 * @type {Set<{
 *   root: ParentNode;
 *   selector: string;
 *   callback: SelectorSubscriber;
 *   registrations: Map<Element, (() => void) | undefined>;
 * }>}
 */
const subscriptions = new Set();
const refCount = new Signal(0);

/** @typedef {[root: ParentNode, selector: string]} RootedSelector */

export function subscribeSelectorAll(
  /** @type {string | RootedSelector} */ selector,
  /** @type {SelectorSubscriber} */ callback,
) {
  if (typeof selector === 'string')
    return subscribeSelectorAllFrom(document, selector, callback);

  const [root, sel] = selector;
  return subscribeSelectorAllFrom(root, sel, callback);
}

function subscribeSelectorAllFrom(
  /** @type {ParentNode} */ root,
  /** @type {string} */ selector,
  /** @type {SelectorSubscriber} */ callback,
) {
  const subscription =
    /** @satisfies {Parameters<(typeof subscriptions)['add']>[0]} */ ({
      root,
      selector,
      callback,
      registrations: new Map(),
    });
  subscriptions.add(subscription);

  refCount.update((v) => v + 1);

  for (const node of root.querySelectorAll(selector))
    registerElement(subscription, node);

  return () => {
    subscriptions.delete(subscription);
    refCount.update((v) => v - 1);
  };
}

function registerElement(
  /** @type {Parameters<(typeof subscriptions)['add']>[0]} */ subscription,
  /** @type {Element} */ element,
) {
  const maybeInvalidator = subscription.callback(element);
  const invalidator = coerceInvalidator(maybeInvalidator);

  subscription.registrations.set(element, invalidator);
}

function unregisterElement(
  /** @type {Parameters<(typeof subscriptions)['add']>[0]} */ subscription,
  /** @type {Element} */ element,
) {
  const invalidator = subscription.registrations.get(element);
  invalidator?.();
  subscription.registrations.delete(element);
}

/** @type {MutationObserver | undefined} */
let observer;
function attachBodyMutationObserver() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    // handle childList mutations
    const childListMutations = mutations.filter(
      (it) => it.type === 'childList',
    );
    const addedNodes = new Set();
    const removedNodes = new Set();
    for (const mutation of childListMutations) {
      for (const node of mutation.addedNodes) addedNodes.add(node);
      for (const node of mutation.removedNodes) removedNodes.add(node);
    }
    const addedOnlyNodes = addedNodes.difference(removedNodes);
    const removedOnlyNodes = removedNodes.difference(addedNodes);

    for (const node of addedOnlyNodes) {
      if (!(node instanceof Element)) continue;

      for (const subscription of subscriptions) {
        const { root, selector, registrations } = subscription;
        if (!root.contains(node)) continue;

        self: if (node.matches(selector)) {
          if (registrations.has(node)) continue;
          registerElement(subscription, node);

          continue;
        }

        children: {
          for (const child of node.querySelectorAll(selector)) {
            if (registrations.has(child)) continue;
            registerElement(subscription, child);
          }

          continue;
        }
      }
    }

    for (const node of removedOnlyNodes) {
      if (!(node instanceof Element)) continue;

      for (const subscription of subscriptions) {
        const { selector, registrations } = subscription;

        self: if (node.matches(selector)) {
          if (!registrations.has(node)) continue;
          unregisterElement(subscription, node);

          continue;
        }

        children: {
          for (const child of node.querySelectorAll(selector)) {
            if (!registrations.has(child)) continue;
            unregisterElement(subscription, child);
          }

          continue;
        }
      }
    }

    // handle attribute mutations
    const attributeNodes = new /** @type {typeof Set<Element>} */ (Set)();
    const attributeMutations = mutations.filter(
      (it) => it.type === 'attributes',
    );
    for (const mutation of attributeMutations) {
      if (!mutation.attributeName) continue;

      const node = mutation.target;
      if (!(node instanceof Element)) continue;

      attributeNodes.add(node);
    }

    for (const node of attributeNodes)
      for (const subscription of subscriptions) {
        const { root, selector, registrations } = subscription;
        if (!root.contains(node)) continue;

        const registered = registrations.has(node);
        if (registered && !node.matches(selector))
          unregisterElement(subscription, node);
        else if (!registered && node.matches(selector))
          registerElement(subscription, node);
      }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

function destroyBodyMutationObserver() {
  observer?.disconnect();
  observer = undefined;
}

subscribe({ refCount }, ({ $refCount }) => {
  if ($refCount > 0) attachBodyMutationObserver();
  else destroyBodyMutationObserver();
});
