import { SvelteSet } from 'svelte/reactivity';

const storageKey = 'ybt.open-rows';

/** Which foldable rows a person has opened — goal groups and tasks with subtasks — kept across visits in the browser. */
class OpenRows {
	#openIds = new SvelteSet<string>();

	isOpen(rowKey: string): boolean {
		return this.#openIds.has(rowKey);
	}

	toggle(rowKey: string): void {
		const wasOpen = this.#openIds.delete(rowKey);
		if (!wasOpen) this.#openIds.add(rowKey);
		this.#save();
	}

	restore(): void {
		const stored = readStoredIds();
		for (const rowKey of stored) this.#openIds.add(rowKey);
	}

	#save(): void {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(storageKey, JSON.stringify([...this.#openIds]));
	}
}

function readStoredIds(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

export const openRows = new OpenRows();

/** Brings back the rows opened on earlier visits once the page is on screen. Call during component setup. */
export function rememberOpenRows(): void {
	$effect(() => openRows.restore());
}
