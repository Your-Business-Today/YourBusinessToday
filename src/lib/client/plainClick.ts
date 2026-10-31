const primaryMouseButton = 0;

/** A click the app may take over: the main button, with no modifier asking the browser for a new tab or window. */
export function isPlainClick(event: MouseEvent): boolean {
	const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
	return event.button === primaryMouseButton && !hasModifier;
}
