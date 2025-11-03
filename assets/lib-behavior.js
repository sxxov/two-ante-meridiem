import {
  Signal,
  derive,
  subscribe,
  coerceInvalidator,
  bin,
} from './lib-signal.js';
import { setAttributes } from './lib-dom-setAttributes.js';
import { subscribeSelectorAll } from './lib-dom-subscribeSelectorAll.js';
import { some } from './lib-type-some.js';
import { unwrap } from './lib-type-unwrap.js';
import {
  registeredGlobalBehaviors,
  elementContexts,
} from './lib-behavior-context-BehaviorContext.js';
import {
  BehaviorPropDescriptor,
  isBehaviorPropDescriptor,
} from './lib-behavior-prop-BehaviorPropDescriptor.js';
import { BehaviorPropKind } from './lib-behavior-prop-BehaviorPropKind.js';
import { getBehaviorAttributeName } from './lib-behavior-serialization-getBehaviorAttributeName.js';
import { getBehaviorPropAttributeName } from './lib-behavior-serialization-getBehaviorPropAttributeName.js';
import { getBehaviorPropStylePropertyName } from './lib-behavior-serialization-getBehaviorPropStylePropertyName.js';
import { queueMicrotask } from './lib-dom-queueMicrotask.js';
import { BehaviorPropDeserialization } from './lib-behavior-prop-BehaviorPropDeserialization.js';
import { BehaviorPropSerialization } from './lib-behavior-prop-BehaviorPropSerialization.js';
/** @import {Values} from './lib-utilities-Values.js' */
/** @import {BehaviorFactory} from './lib-behavior-factory-BehaviorFactory.js' */
/** @import {BehaviorProps} from './lib-behavior-prop-BehaviorProps.js' */
/** @import {BehaviorPropKindValue} from './lib-behavior-prop-BehaviorPropKindValue.js' */
/** @import {BehaviorRepresentation} from './lib-behavior-factory-BehaviorRepresentation.js' */
/** @import {BehaviorFactoryContext} from './lib-behavior-factory-BehaviorFactoryContext.js' */
/** @import {BehaviorElementContext} from './lib-behavior-context-BehaviorElementContext.js' */
/** @import {BehaviorConfigurator} from './lib-behavior-factory-BehaviorConfigurator.js' */
/** @import {BehaviorPropsDescriptorValues} from './lib-behavior-prop-BehaviorPropsDescriptorValues.js' */
/** @import {BehaviorInstance} from './lib-behavior-factory-BehaviorInstance.js' */

export const t = /** @type {const} */ ({
  get boolean() {
    return new BehaviorPropDescriptor(
      BehaviorPropKind.Boolean,
      /**
       * @type {BehaviorPropKindValue<typeof BehaviorPropKind.Boolean>
       *   | undefined}
       */ (undefined),
    );
  },
  get number() {
    return new BehaviorPropDescriptor(
      BehaviorPropKind.Number,
      /**
       * @type {BehaviorPropKindValue<typeof BehaviorPropKind.Number>
       *   | undefined}
       */ (undefined),
    );
  },
  get string() {
    return new BehaviorPropDescriptor(
      BehaviorPropKind.String,
      /**
       * @type {BehaviorPropKindValue<typeof BehaviorPropKind.String>
       *   | undefined}
       */ (undefined),
    );
  },
});
/** @typedef {Values<typeof t>} t */

/**
 * @template {string} const Name
 * @template {BehaviorConfigurator<any>} Configurator
 * @template {BehaviorFactory<InstanceType<Configurator>>} Factory
 * @returns {BehaviorRepresentation<Name, Configurator, Factory>}
 */
export function behavior(
  /** @type {Name} */ name,
  /** @type {Configurator} */ configurator,
  /** @type {Factory} */ factory,
) {
  return {
    name,
    configurator,
    factory,
  };
}

export function registerGlobalBehaviors(
  /** @type {BehaviorRepresentation<string, any, any>[]} */ ...behaviors
) {
  const _ = bin();

  for (const behavior of behaviors) {
    if (registeredGlobalBehaviors.get().has(behavior)) continue;

    add: {
      registeredGlobalBehaviors.update((it) => {
        it.add(behavior);
        registeredGlobalBehaviors.trigger();
        return it;
      });
    }
    remove: _._ = () => {
      registeredGlobalBehaviors.update((it) => {
        it.delete(behavior);
        registeredGlobalBehaviors.trigger();
        return it;
      });
    };

    _._ = queueMicrotask(() => {
      _._ = installBehavior(behavior);
    });
  }

  return _;
}

export function getApplicableBehaviors(/** @type {HTMLElement} */ element) {
  return new Signal(
    new /** @type {typeof Set<BehaviorRepresentation>} */ (Set)(),
    ({ update }) =>
      subscribe(
        { registeredGlobalBehaviors, elementContexts },
        ({ $registeredGlobalBehaviors, $elementContexts }) => {
          const behaviors = new Set($registeredGlobalBehaviors);

          for (
            let ancestor = /** @type {HTMLElement | null} */ (element);
            ancestor;
            ancestor = ancestor.parentElement
          ) {
            const ancestorContext = $elementContexts.get(ancestor);
            if (!ancestorContext) continue;

            const { registeredLocalBehaviors } = ancestorContext;
            for (const behavior of registeredLocalBehaviors.get())
              behaviors.add(behavior);
          }

          update((it) => {
            if (behaviors.size === it.size && behaviors.isSubsetOf(it))
              return it;

            return behaviors;
          });
        },
      ),
  ).readonly;
}

/** @template {BehaviorRepresentation<string, any, any>} Behavior */
export function getAttachedBehavior(
  /** @type {HTMLElement} */ element,
  /** @type {Behavior} */ behavior,
) {
  const initial = /** @type {BehaviorInstance<Behavior> | undefined} */ (
    undefined
  );
  return new Signal(initial, ({ set, trigger }) =>
    subscribe({ elementContexts }, ({ $elementContexts }) => {
      const context = $elementContexts.get(element);
      if (!context) {
        set(initial);
        return;
      }

      const { behaviorToProps } = context;
      return subscribe({ behaviorToProps }, ({ $behaviorToProps }) => {
        set(
          /** @type {BehaviorInstance<Behavior> | undefined} */ (
            $behaviorToProps.get(behavior)
          ),
        );
        trigger();
      });
    }),
  ).readonly;
}

export function getAttachedBehaviors(/** @type {HTMLElement} */ element) {
  const initial =
    new /** @type {typeof Map<BehaviorRepresentation, BehaviorProps>} */ (
      Map
    )();
  return new Signal(initial, ({ set, trigger }) =>
    subscribe({ elementContexts }, ({ $elementContexts }) => {
      const context = $elementContexts.get(element);
      if (!context) {
        set(initial);
        return;
      }

      const { behaviorToProps } = context;
      return subscribe({ behaviorToProps }, ({ $behaviorToProps }) => {
        set($behaviorToProps);
        trigger();
      });
    }),
  ).readonly;
}

export function hasAttachedBehavior(
  /** @type {HTMLElement} */ element,
  /** @type {BehaviorRepresentation<string, any, any>} */ behavior,
) {
  const attributeName = getBehaviorAttributeName(behavior.name);
  return element.hasAttribute(attributeName);
}

/** @template {BehaviorRepresentation<string, any, any>} Behavior */
export function attachBehavior(
  /** @type {HTMLElement} */ element,
  /** @type {Behavior} */ behavior,
  /**
   * @type {BehaviorPropsDescriptorValues<
   *   InstanceType<Behavior['configurator']>
   * >}
   */ props,
) {
  const _ = bin();
  const { name } = behavior;
  const attributeName = getBehaviorAttributeName(name);
  const attributes = {
    [attributeName]: true,
    ...Object.fromEntries(
      Object.entries(props).map(([key, value]) => [
        getBehaviorPropAttributeName(name, key),
        value,
      ]),
    ),
  };
  setAttributes(element, attributes);
  _._ = () => {
    for (const key of Object.keys(attributes)) {
      element.removeAttribute(key);
    }
  };
  return _;
}

export function detachBehavior(
  /** @type {HTMLElement} */ element,
  /** @type {BehaviorRepresentation<string, any, any>} */ behavior,
) {
  const { name } = behavior;
  const attributeName = getBehaviorAttributeName(name);
  const propAttributeNames = (() => {
    const context = elementContexts.get().get(element);
    if (!context) return;

    const props = context.behaviorToProps.get().get(behavior);
    if (!props) return;

    return Object.keys(props).map((key) =>
      getBehaviorPropAttributeName(name, key),
    );
  })();

  for (const name of [attributeName, ...(propAttributeNames ?? [])]) {
    element.removeAttribute(name);
  }
}

function installBehavior(
  /** @type {BehaviorRepresentation<string, any, any>} */ behavior,
  /** @type {ParentNode} */ root = document,
) {
  const _ = bin();

  const { name, configurator, factory } = behavior;
  const attributeName = getBehaviorAttributeName(name);
  _._ = subscribeSelectorAll([root, `[${attributeName}]`], (element) => {
    if (!(element instanceof HTMLElement)) return;

    const _ = bin();

    const props = new configurator();
    const propDescriptorEntries = Object.entries(
      /** @type {Record<string, BehaviorPropDescriptor>} */ (props),
    ).filter(([, value]) => isBehaviorPropDescriptor(value));

    const hydrateProps = () => {
      for (const [key, descriptor] of propDescriptorEntries) {
        const { deserializeMapper, deserializeMode } = descriptor;
        if (deserializeMode === BehaviorPropDeserialization.None) continue;

        const attributeName = getBehaviorPropAttributeName(name, key);
        const serializedValue = (() => {
          let value;

          if (deserializeMode & BehaviorPropDeserialization.Attribute)
            value = element.getAttribute(attributeName) ?? undefined;

          return value;
        })();
        const deserializedValue = deserializeMapper(serializedValue);
        descriptor.set(deserializedValue);
      }
    };
    hydrateProps();
    const mo = new MutationObserver(hydrateProps);
    mo.observe(element, {
      attributes: true,
      attributeFilter: propDescriptorEntries.map(([key]) =>
        getBehaviorPropAttributeName(name, key),
      ),
    });
    _._ = () => {
      mo.disconnect();
    };

    const propagatePropAttribute = (
      /** @type {string} */ attributeName,
      /** @type {string | undefined} */ serializedValue,
    ) => {
      if (some(serializedValue))
        element.setAttribute(attributeName, serializedValue);
      else element.removeAttribute(attributeName);
    };
    const propagatePropStyle = (
      /** @type {string} */ propertyName,
      /** @type {string | undefined} */ serializedValue,
    ) => {
      if (some(serializedValue))
        element.style.setProperty(propertyName, serializedValue);
      else element.style.removeProperty(propertyName);
    };
    for (const [key, descriptor] of propDescriptorEntries) {
      const { serializeMapper, serializeMode } = descriptor;
      if (serializeMode === BehaviorPropSerialization.None) continue;

      _._ = descriptor.subscribe((deserializedValue) => {
        const serializedValue = serializeMapper(deserializedValue);

        if (serializeMode & BehaviorPropSerialization.Attribute) {
          const attributeName = getBehaviorPropAttributeName(name, key);
          propagatePropAttribute(attributeName, serializedValue);
        }

        if (serializeMode & BehaviorPropSerialization.Style) {
          const stylePropertyName = getBehaviorPropStylePropertyName(name, key);
          propagatePropStyle(stylePropertyName, serializedValue);
        }
      });
    }

    let elementContext = elementContexts.get().get(element);
    if (!elementContext) {
      const registeredLocalBehaviors = new Signal(
        new /** @type {typeof Set<BehaviorRepresentation>} */ (Set)(),
        ({ subscribe }) =>
          subscribe((it) => {
            const _ = bin();
            for (const behavior of it) _._ = installBehavior(behavior, element);
            return _;
          }),
      );
      elementContext = {
        behaviorToProps: new Signal(new Map()),
        registeredLocalBehaviors,
      };
      add: {
        elementContexts.update((it) => {
          it.set(element, unwrap(elementContext));
          elementContexts.trigger();
          return it;
        });
      }
      remove: _._ = () => {
        elementContexts.update((it) => {
          it.delete(element);
          elementContexts.trigger();
          return it;
        });
      };
    }
    const { behaviorToProps, registeredLocalBehaviors } = elementContext;
    behaviorToProps.update((it) => {
      it.set(behavior, props);
      behaviorToProps.trigger();
      return it;
    });

    /** @type {BehaviorFactoryContext<typeof props>} */
    const factoryContext = {
      registerLocalBehaviors(...behaviors) {
        registeredLocalBehaviors.update((it) => {
          const { size } = it;

          for (const behavior of behaviors) it.add(behavior);
          if (it.size !== size) registeredLocalBehaviors.trigger();

          return it;
        });
      },
      getContext: (behavior) =>
        new Signal(
          /** @type {BehaviorInstance<typeof behavior> | undefined} */ (
            undefined
          ),
          ({ set, get }) =>
            subscribe({ elementContexts }, ({ $elementContexts }) => {
              const _ = bin();

              /** @type {any[]} */
              const stack = [];
              for (
                let ancestor = /** @type {HTMLElement | null} */ (element),
                  i = 0;
                ancestor;
                ancestor = ancestor.parentElement, i++
              ) {
                const ancestorContext = $elementContexts.get(ancestor);
                if (!ancestorContext) continue;

                const { behaviorToProps } = ancestorContext;
                _._ = subscribe({ behaviorToProps }, ({ $behaviorToProps }) => {
                  const props = /** @type {any} */ (
                    $behaviorToProps.get(behavior)
                  );
                  if (!props) return;

                  stack[i] = props;
                  set(props);
                  return () => {
                    stack[i] = undefined;
                    set(stack.find(some));
                  };
                });
              }
            }),
        ).readonly,
    };

    const maybeFactoryInvalidator = factory(element, props, factoryContext);
    const factoryInvalidator = coerceInvalidator(maybeFactoryInvalidator);
    if (factoryInvalidator) _._ = factoryInvalidator;

    return _;
  });

  return _;
}
