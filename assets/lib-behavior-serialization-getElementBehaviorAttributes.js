import { getAttachedBehaviors } from '../behavior.js';
import { getBehaviorSerializablePropAttributes } from './getBehaviorSerializablePropAttributes.js';
import { subscribe, bin, Signal } from '/+std/signal/Signal.js';

export function getElementBehaviorAttributes(
	/** @type {HTMLElement} */ element,
) {
	const behaviors = getAttachedBehaviors(element);
	const initial = new /** @type {typeof Map<string, string>} */ (Map)();
	return new Signal(initial, ({ trigger, update }) =>
		subscribe({ behaviors }, ({ $behaviors }) => {
			const _ = bin();

			for (const [behavior, props] of $behaviors) {
				const attributes = getBehaviorSerializablePropAttributes(
					behavior.name,
					props,
				);
				const currentAttributeKeys =
					new /** @type {typeof Set<string>} */ (Set)();
				_._ = subscribe({ attributes }, ({ $attributes }) => {
					update((it) => {
						let changed = false;
						for (const key of currentAttributeKeys)
							if (!$attributes.has(key)) {
								it.delete(key);
								currentAttributeKeys.delete(key);
								changed = true;
							}
						for (const [key, value] of $attributes)
							if (!Signal.compare(it.get(key), value)) {
								it.set(key, value);
								currentAttributeKeys.add(key);
								changed = true;
							}

						if (changed) trigger();
						return it;
					});
				});
				_._ = () => {
					update((it) => {
						let changed = false;
						for (const key of currentAttributeKeys) {
							if (!(key in it)) continue;

							it.delete(key);
							changed = true;
						}
						currentAttributeKeys.clear();

						if (changed) trigger();
						return it;
					});
				};
			}

			return _;
		}),
	).readonly;
}
