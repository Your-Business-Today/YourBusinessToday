import { describeMyBrains } from './describeMyBrains';
import { searchChatbotBrains } from './myChatbotBrains';
import { searchOrganisationBrains } from './myOrganisationBrains';
import { validateBusinessBrainSearch } from '$lib/server/businessBrain/validateBusinessBrainReading';
import { validateChatbotQuestionAsked } from '$lib/server/businessBrain/validateChatbotQuestion';
import { validateRecordId } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import type { McpCaller } from '../resolveMcpCaller';

/** Searches every brain the caller reaches, or those of one organisation, and says which hold something on the words. */
export async function searchMyBrains(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const asked = validateChatbotQuestionAsked(input);
	if (typeof asked === 'string') return asked;
	const search = validateBusinessBrainSearch(input);
	if (typeof search === 'string') return search;
	const narrowing = validateOrganisationScope(input);
	if (typeof narrowing === 'string') return narrowing;
	const scope = { ...narrowing, searchText: search.searchText };
	const [whole, named] = await Promise.all([searchOrganisationBrains(caller, scope), searchChatbotBrains(caller, scope, asked.question)]);
	return describeMyBrains(search.searchText, [...named, ...whole]);
}

function validateOrganisationScope(input: Record<string, unknown>): { organisationId: string | null } | string {
	const organisationId = trimmedText(input.organisationId);
	if (organisationId === '') return { organisationId: null };
	return validateRecordId('organisationId', organisationId) ?? { organisationId };
}
