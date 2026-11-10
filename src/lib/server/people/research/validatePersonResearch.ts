import { personResearchLimits, type PersonResearchFindings } from '$lib/data/personResearchRules';
import { researchSourceRefusal } from '$lib/server/clients/researchSourceRefusal';
import { trimmedText } from '$lib/data/trimmedText';
import { validateFindingList } from './validateFindingList';
import { validateFoundLinks } from './validateFoundLinks';
import { validateFoundRoles } from './validateFoundRoles';
import { validateRecordId } from '$lib/data/isUuid';

const { longestSummary, mostSources, longestSourceUrl } = personResearchLimits;

export const findingsNeedSummary = `The summary is 1 to ${longestSummary} characters: who they are in business and what they are known for.`;
export const sourcesRefusal = `Give sources as a list of 1 to ${mostSources} public pages you read.`;

/** The findings as given, each value checked against what it is written to, or a sentence naming what does not fit. */
export function validatePersonResearch(input: Record<string, unknown>): PersonResearchFindings | string {
	const personId = trimmedText(input.personId);
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const summary = trimmedText(input.summary);
	if (summary === '' || summary.length > longestSummary) return findingsNeedSummary;
	const sources = validateSources(input.sources);
	if (typeof sources === 'string') return sources;
	const roles = validateFoundRoles(input.roles);
	if (typeof roles === 'string') return `roles — ${roles}`;
	const links = validateFoundLinks(input.links);
	if (typeof links === 'string') return `links — ${links}`;
	return { personId, summary, roles, links, sources };
}

function validateSources(value: unknown): string[] | string {
	const pages = validateFindingList(value, mostSources, sourcesRefusal, validateSourcePage);
	if (typeof pages === 'string') return `sources — ${pages}`;
	if (pages.length === 0) return sourcesRefusal;
	return pages.map((page) => page.url);
}

function validateSourcePage(entry: unknown): { url: string } | string {
	const url = trimmedText(entry);
	return researchSourceRefusal('source', url, longestSourceUrl) ?? { url };
}
