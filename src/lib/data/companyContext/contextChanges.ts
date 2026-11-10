import { isTheSamePart } from './samePart';
import type { CompanyContextVersion, ContextPart } from './companyContext';

/** What a version changed since the one before it: the parts it added, put differently and left out. */
export type ContextChanges = {
	sinceVersion: number;
	added: ContextPart[];
	changed: ContextPart[];
	removed: ContextPart[];
};

/** The parts of the later version told against the earlier one by their keys, which stay the same between runs. */
export function contextChanges(earlier: CompanyContextVersion, later: CompanyContextVersion): ContextChanges {
	const earlierByKey = new Map(earlier.parts.map((part) => [part.key, part]));
	const laterKeys = new Set(later.parts.map((part) => part.key));
	const isPutDifferently = (part: ContextPart) => {
		const earlierPart = earlierByKey.get(part.key);
		if (earlierPart === undefined) return false;
		return !isTheSamePart({ part: earlierPart, context: earlier }, { part, context: later });
	};
	return {
		sinceVersion: earlier.versionNumber,
		added: later.parts.filter((part) => !earlierByKey.has(part.key)),
		changed: later.parts.filter(isPutDifferently),
		removed: earlier.parts.filter((part) => !laterKeys.has(part.key))
	};
}

export function hasChanges({ added, changed, removed }: ContextChanges): boolean {
	return added.length + changed.length + removed.length > 0;
}
