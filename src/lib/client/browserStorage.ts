export type StorageArea = 'visit' | 'device';

function storageFor(area: StorageArea): Storage {
	return area === 'visit' ? sessionStorage : localStorage;
}

export function readStored<Value>(area: StorageArea, key: string, fallback: Value): Value {
	try {
		const stored = storageFor(area).getItem(key);
		return stored === null ? fallback : (JSON.parse(stored) as Value);
	} catch {
		return fallback;
	}
}

export function writeStored(area: StorageArea, key: string, value: unknown): void {
	try {
		storageFor(area).setItem(key, JSON.stringify(value));
	} catch {
		return;
	}
}
