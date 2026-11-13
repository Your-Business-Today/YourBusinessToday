type Pausable = { pause: () => void; resume: () => void };

/** Whether the page is on screen, as one live signal shared by every scene. */
class PageVisibility {
	#isHidden = $state(false);

	constructor() {
		if (typeof document === 'undefined') return;
		this.#isHidden = document.hidden;
		document.addEventListener('visibilitychange', () => (this.#isHidden = document.hidden));
	}

	get isHidden(): boolean {
		return this.#isHidden;
	}
}

export const pageVisibility = new PageVisibility();

/** Rests a scene while its tab is hidden and wakes it when the tab is seen again. Call during component setup. */
export function restWhilePageHidden(scene: () => Pausable | undefined): void {
	$effect(() => {
		const current = scene();
		if (current === undefined) return;
		if (pageVisibility.isHidden) return current.pause();
		current.resume();
	});
}
