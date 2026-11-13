/** Scene chrome sits top-left, under the title band: the top-right corner belongs to the toolbar. */
export const sceneHudPosition = 'absolute top-4 left-4 z-10';

/** Pointer hints only make sense with a mouse, and on a phone they would sit under the brain strip. */
export const sceneHintPosition =
	'pointer-events-none absolute bottom-16 left-1/2 hidden -translate-x-1/2 lg:block';

export const sceneHudPillClass =
	'rounded-full border border-hairline bg-night/70 px-3 py-1 text-chalk/80 backdrop-blur transition hover:border-chalk/40 hover:text-chalk';
