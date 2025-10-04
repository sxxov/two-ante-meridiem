import { isBehaviorPropDescriptor } from '../prop/BehaviorPropDescriptor.js';
import { BehaviorPropSerialization } from '../prop/BehaviorPropSerialization.js';
import { getBehaviorAttributeName } from './getBehaviorAttributeName.js';
import { getBehaviorPropAttributeName } from './getBehaviorPropAttributeName.js';
import { getBehaviorPropSerializedValue } from './getBehaviorPropSerializedValue.js';
import { some } from '/+std/functional/some.js';
import { bin, Signal } from '/+std/signal/Signal.js';
/** @import {BehaviorProps} from '../prop/BehaviorProps.js' */
/** @import {BehaviorRepresentation} from '../factory/BehaviorRepresentation.js' */
/** @import {BehaviorPropDescriptor} from '../prop/BehaviorPropDescriptor.js'; */

export function getBehaviorSerializablePropAttributes(
	/** @type {string} */ behaviorName,
	/** @type {BehaviorProps} */ props,
) {
	const behaviorAttributeName = getBehaviorAttributeName(behaviorName);
	const descriptors = /** @type {Record<string, BehaviorPropDescriptor>} */ (
		Object.fromEntries(
			Object.entries(props).filter(
				([, value]) =>
					isBehaviorPropDescriptor(value) &&
					value.serialization ===
						BehaviorPropSerialization.Serialized,
			),
		)
	);

	const initial = new /** @type {typeof Map<string, string>} */ (Map)([
		[behaviorAttributeName, ''],
	]);
	return new Signal(initial, ({ update, trigger }) => {
		const _ = bin();
		for (const [key, descriptor] of Object.entries(descriptors)) {
			const name = getBehaviorPropAttributeName(behaviorName, key);
			const { kind } = descriptor;
			_._ = descriptor.subscribe((value) => {
				const serializedValue = getBehaviorPropSerializedValue(
					kind,
					value,
				);

				update((it) => {
					if (some(serializedValue)) {
						if (!Signal.compare(it.get(name), serializedValue)) {
							it.set(name, serializedValue);
							trigger();
						}
					} else {
						if (name in it) {
							it.delete(name);
							trigger();
						}
					}

					return it;
				});
			});
		}
	});
}
