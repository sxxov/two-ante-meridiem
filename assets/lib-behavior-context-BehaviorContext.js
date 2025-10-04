import { Signal } from './lib-signal.js';
/** @import {BehaviorElementContext} from './lib-behavior-context-BehaviorElementContext.js' */
/** @import {BehaviorRepresentation} from './lib-behavior-factory-BehaviorRepresentation.js' */

globalThis.BehaviorContext ??= (() => {
  try {
    return /** @type {typeof window & typeof globalThis} */ (parent)
      .BehaviorContext;
  } catch {}
})() ?? {
  elementContexts: new Signal(new WeakMap()),
  registeredGlobalBehaviors: new Signal(new Set()),
};
export const { BehaviorContext } = globalThis;
export const { elementContexts, registeredGlobalBehaviors } = BehaviorContext;

/**
 * @typedef {{
 *   elementContexts: Signal<WeakMap<HTMLElement, BehaviorElementContext>>;
 *   registeredGlobalBehaviors: Signal<Set<BehaviorRepresentation>>;
 * }} BehaviorContext
 */
