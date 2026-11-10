import { personResearchLimits, type FoundLink } from '$lib/data/personResearchRules';
import { researchSourceRefusal } from '$lib/server/clients/researchSourceRefusal';
import { trimmedText } from '$lib/data/trimmedText';
import { validateFindingList } from './validateFindingList';

const { mostLinks, longestLinkLabel, longestSourceUrl } = personResearchLimits;

export const linksRefusal = `Give links as a list of at most ${mostLinks}, each with label and url.`;

/** The links as given, each a public page worth keeping on the person's record, or a sentence naming what does not fit. */
export function validateFoundLinks(value: unknown): FoundLink[] | string {
	return validateFindingList(value, mostLinks, linksRefusal, validateFoundLink);
}

function validateFoundLink(entry: unknown): FoundLink | string {
	const fields = (entry ?? {}) as Record<string, unknown>;
	const label = trimmedText(fields.label);
	if (label === '' || label.length > longestLinkLabel) return `The label is 1 to ${longestLinkLabel} characters.`;
	const url = trimmedText(fields.url);
	const pageRefusal = researchSourceRefusal('url', url, longestSourceUrl);
	if (pageRefusal !== null) return pageRefusal;
	return { label, url };
}
