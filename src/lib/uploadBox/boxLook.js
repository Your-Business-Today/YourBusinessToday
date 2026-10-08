/**
 * @typedef {{ theme?: string, styles?: { variables?: Record<string, string | undefined> },
 *   safeAreaInsets?: Record<string, number | undefined> }} HostLook
 */

/**
 * Takes on the host's theme and style variables, and keeps clear of the edges the host covers.
 * A change carries only what changed, so each part is applied only when it is there.
 * @param {HostLook} hostLook
 */
export function applyHostLook(hostLook) {
	const { theme, styles = {}, safeAreaInsets = {} } = hostLook;
	const rootStyle = document.documentElement.style;
	if (theme !== undefined) rootStyle.colorScheme = theme;
	for (const [name, value] of Object.entries(styles.variables ?? {})) {
		if (value !== undefined) rootStyle.setProperty(name, value);
	}
	for (const [side, inset] of Object.entries(safeAreaInsets)) {
		if (inset !== undefined) rootStyle.setProperty(`--inset-${side}`, `${inset}px`);
	}
}
