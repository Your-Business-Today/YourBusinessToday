import type { SupabaseClient } from '@supabase/supabase-js';
import { addPersonLink } from '../addPersonLink';
import { addPersonNote } from '../addPersonNote';
import { getLinksForPeople } from '../getLinksForPeople';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import type { FoundLink } from './personFindings';
import type { PersonCompany } from '../getCompaniesForPerson';

export type ReviewedFindings = {
	personId: string;
	summary: string;
	roleLines: string[];
	links: FoundLink[];
	sources: string[];
};

export function readReviewedFindings(formData: FormData): ReviewedFindings | null {
	const personId = String(formData.get('personId') ?? '');
	if (personId === '') return null;
	const labels = formData.getAll('linkLabel').map(String);
	const urls = formData.getAll('linkUrl').map(String);
	const keptIndexes = formData.getAll('linkKept').map(Number);
	return {
		personId,
		summary: String(formData.get('summary') ?? '').trim(),
		roleLines: formData.getAll('roleLine').map(String),
		links: keptIndexes
			.map((index) => ({ label: (labels[index] ?? '').trim(), url: (urls[index] ?? '').trim() }))
			.filter((link) => link.label !== '' && link.url !== ''),
		sources: formData.getAll('sourceUrl').map(String)
	};
}

export async function savePersonFindings(
	supabase: SupabaseClient,
	findings: ReviewedFindings,
	personName: string,
	companies: PersonCompany[],
	actorAccountId: string
): Promise<number> {
	const heldUrls = new Set((await getLinksForPeople(supabase, [findings.personId])).map((link) => link.url));
	const newLinks = findings.links.filter((link) => !heldUrls.has(link.url));
	for (const link of newLinks) await addPersonLink(supabase, findings.personId, link);
	if (findings.summary !== '') {
		await addPersonNote(supabase, findings.personId, 'research', composeResearchNote(findings), actorAccountId);
	}
	for (const company of companies) {
		await recordClientEvent(supabase, company.id, 'person_researched', { person: personName }, actorAccountId);
	}
	return newLinks.length;
}

function composeResearchNote(findings: ReviewedFindings): string {
	return [
		findings.summary,
		listed('Roles found', findings.roleLines),
		listed('Read from', findings.sources)
	]
		.filter((section) => section !== '')
		.join('\n\n');
}

function listed(heading: string, lines: string[]): string {
	if (lines.length === 0) return '';
	return `${heading}:\n${lines.map((line) => `- ${line}`).join('\n')}`;
}
