import type { WatchedKind, WatchedThing } from '$lib/data/news/watchListRules';

export const watchedThingColumns = 'id, kind, value, label, added_at';

export type WatchedThingRow = { id: string; kind: WatchedKind; value: string; label: string; added_at: string };

export function watchedThingOf(row: WatchedThingRow): WatchedThing {
	return { id: row.id, kind: row.kind, value: row.value, label: row.label, addedAt: row.added_at };
}
