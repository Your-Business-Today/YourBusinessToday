import { businessBrainPartKinds, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { BusinessBrainIndexEntry } from '$lib/server/businessBrain/readBusinessBrainIndex';
import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

/** The index's columns: the page, the part it is kept in, what kind of page it is and when it last changed. */
export const indexColumns: RecordsColumn<BusinessBrainIndexEntry>[] = [
	{ key: 'title', label: 'Page', sortValue: (entry) => entry.title },
	{ key: 'part', label: 'Part', sortValue: (entry) => businessBrainPartKinds.indexOf(entry.partKind) },
	{ key: 'kind', label: 'Kind', isWideOnly: true, sortValue: (entry) => entry.kind },
	{ key: 'updated', label: 'Updated', isWideOnly: true, sortValue: (entry) => entry.updatedAt }
];

/** Each part of the brain keeps its own colour wherever it is named, so a part reads the same everywhere. */
export const partBadgeTones: Record<BusinessBrainPartKind, BadgeTone> = {
	expertise: 'progress',
	experience: 'positive',
	process: 'warning',
	people: 'neutral'
};
