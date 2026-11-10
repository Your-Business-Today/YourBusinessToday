import { personResearchLimits, type FoundRole } from '$lib/data/personResearchRules';
import { researchSourceRefusal } from '$lib/server/clients/researchSourceRefusal';
import { trimmedText } from '$lib/data/trimmedText';
import { validateFindingList } from './validateFindingList';

const { mostRoles, longestRoleTitle, longestOrganisation, longestSourceUrl } = personResearchLimits;

export const rolesRefusal = `Give roles as a list of at most ${mostRoles}, each with title, organisation and sourceUrl.`;

/** The roles as given, each with the public page it was read on, or a sentence naming what does not fit. */
export function validateFoundRoles(value: unknown): FoundRole[] | string {
	return validateFindingList(value, mostRoles, rolesRefusal, validateFoundRole);
}

function validateFoundRole(entry: unknown): FoundRole | string {
	const fields = (entry ?? {}) as Record<string, unknown>;
	const title = trimmedText(fields.title);
	if (title === '' || title.length > longestRoleTitle) return `The title is 1 to ${longestRoleTitle} characters.`;
	const organisation = trimmedText(fields.organisation);
	if (organisation.length > longestOrganisation) return `The organisation is at most ${longestOrganisation} characters.`;
	const sourceUrl = trimmedText(fields.sourceUrl);
	const sourceRefusal = researchSourceRefusal('sourceUrl', sourceUrl, longestSourceUrl);
	if (sourceRefusal !== null) return sourceRefusal;
	return { title, organisation, sourceUrl };
}
