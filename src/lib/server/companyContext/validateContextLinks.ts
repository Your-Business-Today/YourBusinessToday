import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextLinkKinds } from '$lib/data/companyContext/companyContext';
import { fieldsOf, isRefused, readChoice, readList, readRequiredText } from './contextText';
import type { ContextLink } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** The links between parts: each names two different parts of this version, and none is given twice. */
export function validateContextLinks(value: unknown, partKeys: Set<string>): ContextLink[] | Refusal {
	const candidates = readList(value, limits.mostLinks, 'links');
	if (isRefused(candidates)) return candidates;
	const links: ContextLink[] = [];
	const seen = new Set<string>();
	for (const [index, candidate] of candidates.entries()) {
		const link = readLink(candidate, index + 1, partKeys);
		if (isRefused(link)) return link;
		const identity = `${link.fromKey} ${link.kind} ${link.toKey}`;
		if (seen.has(identity))
			return {
				refusal: `Link ${index + 1} repeats ${identity}: give each link once.`
			};
		seen.add(identity);
		links.push(link);
	}
	return links;
}

function readLink(candidate: unknown, position: number, partKeys: Set<string>): ContextLink | Refusal {
	const fields = fieldsOf(candidate);
	const label = `Link ${position}`;
	const fromKey = readPartReference(fields.fromKey, `${label} fromKey`, partKeys);
	if (isRefused(fromKey)) return fromKey;
	const kind = readChoice(fields.kind, contextLinkKinds, `${label} kind`);
	if (isRefused(kind)) return kind;
	const toKey = readPartReference(fields.toKey, `${label} toKey`, partKeys);
	if (isRefused(toKey)) return toKey;
	if (fromKey === toKey) return { refusal: `${label} goes from "${fromKey}" to itself.` };
	return { fromKey, kind, toKey };
}

function readPartReference(value: unknown, field: string, partKeys: Set<string>): string | Refusal {
	const key = readRequiredText(value, { field, limit: limits.keyLength });
	if (isRefused(key)) return key;
	if (partKeys.has(key)) return key;
	return {
		refusal: `${field} "${key}" is not the key of a part in this version.`
	};
}
