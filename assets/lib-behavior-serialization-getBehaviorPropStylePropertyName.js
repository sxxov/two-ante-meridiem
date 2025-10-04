export function getBehaviorPropStylePropertyName(
	/** @type {string} */ behaviorName,
	/** @type {string} */ propName,
) {
	return `--${`${behaviorName}${propName ? `-${propName}` : ''}`.replace(
		/([A-Z])/g,
		(_, c) => `-${c.toLowerCase()}`,
	)}`;
}
