import type { SupabaseClient } from '@supabase/supabase-js';
import { approachSystemPrompt, approachTool } from './approachPrompt';
import { describeCompanyForApproach, describePersonForApproach } from './approachContext';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import type { PersonCompany } from './getCompaniesForPerson';
import type { PersonInFull } from './getPerson';

export type ApproachDraft = {
	personId: string;
	personName: string;
	openingMessage: string;
	callPlan: string;
};

const longestDraftTokens = 1500;

export async function draftApproach(
	supabase: SupabaseClient,
	person: PersonInFull,
	companies: PersonCompany[],
	actorAccountId: string
): Promise<ApproachDraft> {
	const response = await requestAnthropic({
		system: approachSystemPrompt,
		messages: [{ role: 'user', content: briefFor(person, companies) }],
		tools: [approachTool],
		forcedToolName: approachTool.name,
		maxTokens: longestDraftTokens
	});
	const draft = toolUseFrom(response, approachTool.name) as Record<string, unknown> | undefined;
	if (draft === undefined) throw new Error('Claude did not return an approach');
	for (const company of companies) {
		await recordClientEvent(supabase, company.id, 'approach_drafted', { person: person.name }, actorAccountId);
	}
	return {
		personId: person.id,
		personName: person.name,
		openingMessage: String(draft.opening_message ?? '').trim(),
		callPlan: String(draft.call_plan ?? '').trim()
	};
}

function briefFor(person: PersonInFull, companies: PersonCompany[]): string {
	const companyBlocks = companies.map(describeCompanyForApproach);
	if (companyBlocks.length === 0) companyBlocks.push('No company is recorded for this person yet.');
	return [
		'Draft the first approach to this person, speaking to their business as a whole.',
		'',
		describePersonForApproach(person),
		'',
		`Their companies (${companies.length}):`,
		...companyBlocks
	].join('\n\n');
}

export function composeApproachNote(openingMessage: string, callPlan: string): string {
	return `Opening message\n${openingMessage}\n\nCall plan\n${callPlan}`;
}
