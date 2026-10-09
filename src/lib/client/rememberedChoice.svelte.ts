/**
 * One choice a person made on a page — which tab they were on — kept in the
 * browser so the page opens where they left it. Reads the fallback on the
 * server and until the page is on screen; call remember() during component
 * setup to bring the stored choice back.
 */
export class RememberedChoice {
	#storageKey: string;
	#chosen = $state('');

	constructor(storageKey: string, fallback: string) {
		this.#storageKey = storageKey;
		this.#chosen = fallback;
	}

	get key(): string {
		return this.#chosen;
	}

	set key(value: string) {
		this.#chosen = value;
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(this.#storageKey, value);
	}

	remember(allowedKeys: string[]): void {
		$effect(() => {
			const stored = readStoredChoice(this.#storageKey);
			if (stored !== null && allowedKeys.includes(stored)) this.#chosen = stored;
		});
	}
}

function readStoredChoice(storageKey: string): string | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		return localStorage.getItem(storageKey);
	} catch {
		return null;
	}
}
