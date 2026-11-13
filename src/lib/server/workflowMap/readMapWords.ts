import { workflowMapLimits as limits, mapKeyShape } from '$lib/data/workflowMap/workflowMapLimits';
import { isRefused, readList, readRequiredText, type TextRule } from '$lib/server/companyContext/contextText';
import type { Refusal } from '$lib/server/portal/portalFormReading';

const keyExample = 'lower-case words joined by hyphens, such as work-order-award';

/** A line's or a station's key, kept the same from version to version so it keeps its place on the map. */
export function readMapKey(value: unknown, field: string): string | Refusal {
	const key = readRequiredText(value, { field, limit: limits.keyLength });
	if (isRefused(key)) return key;
	if (mapKeyShape.test(key)) return key;
	return { refusal: `${field} must be ${keyExample}.` };
}

/** A list of short names, such as what a station takes in: each one checked against its column, none repeated. */
export function readMapWords(value: unknown, rule: TextRule): string[] | Refusal {
	const candidates = readList(value, limits.mostWordsInAList, rule.field);
	if (isRefused(candidates)) return candidates;
	const words: string[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const word = readRequiredText(candidate, { field: `${rule.field} ${index + 1}`, limit: rule.limit });
		if (isRefused(word)) return word;
		if (words.includes(word)) return { refusal: `${rule.field} ${index + 1} repeats "${word}": name each once.` };
		words.push(word);
	}
	return words;
}

/** The slugs of Domain things a station takes in or produces, as the organisation's Domain names them. */
export function readThingSlugs(value: unknown, field: string): string[] | Refusal {
	const slugs = readMapWords(value, { field, limit: limits.thingSlugLength });
	if (isRefused(slugs)) return slugs;
	const misshapen = slugs.find((slug) => !mapKeyShape.test(slug));
	if (misshapen === undefined) return slugs;
	return { refusal: `${field} "${misshapen}" must be a Domain thing's slug, ${keyExample}.` };
}
