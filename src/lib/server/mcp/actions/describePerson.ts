import { clientStageLabels } from '$lib/data/clientLifecycle';
import { describeCompanyProfile } from './describeCompanyProfile';
import { formatBritishDate } from '$lib/data/britishDate';
import { seniorityLabels, warmthLabels } from '$lib/data/contactProfileFields';
import { personNoteKinds } from '$lib/data/personNoteKind';
import type { AuthoredNote } from '$lib/server/people/authoredNotes';
import type { PersonCompany } from '$lib/server/people/getCompaniesForPerson';
import type { PersonInFull } from '$lib/server/people/getPerson';

export const noSuchPerson = 'No person on the People register has that id. read_client lists the people at a company, each with their person id.';

const noteKindLabels: Record<string, string> = {
	[personNoteKinds.note]: 'Note',
	[personNoteKinds.approach]: 'Drafted approach',
	[personNoteKinds.research]: 'Found on the web'
};

/** What the register holds on a person and each company they sit on, for a staff member's Claude to research from or draft an approach with. */
export function describePersonInFull(person: PersonInFull, companies: PersonCompany[]): string {
	const { links, notes } = person;
	return [
		`${person.name} — person ${person.id}`,
		knownFact('Email', person.email),
		knownFact('Phone', person.phone),
		knownFact('Companies House officer id', person.officerId ?? ''),
		...describeStanding(person),
		'',
		'Links held:',
		links.length === 0 ? 'None yet.' : links.map((link) => `- ${link.label}: ${link.url}`).join('\n'),
		'',
		`Companies (${companies.length}):`,
		companies.length === 0 ? 'None yet.' : companies.map(describePersonCompany).join('\n\n'),
		'',
		'Notes, newest first:',
		notes.length === 0 ? 'None yet.' : notes.map(describeNote).join('\n\n')
	]
		.filter((line) => line !== null)
		.join('\n');
}

function describePersonCompany(company: PersonCompany): string {
	const part = company.officerRole || company.role || 'part not recorded';
	const website = company.website === '' ? 'no website held' : company.website;
	const standing = `our standing: ${clientStageLabels[company.stage]}`;
	return [`${company.name} — client ${company.id} — ${part} — ${standing} — ${website}`, ...describeCompanyProfile(company)].join('\n');
}

function describeStanding(person: PersonInFull): string[] {
	const lastContacted = person.lastContactedOn === null ? 'never' : formatBritishDate(person.lastContactedOn);
	return [
		`Seniority: ${seniorityLabels[person.seniority]}`,
		`Decision maker: ${person.isDecisionMaker ? 'yes' : 'not known to be'}`,
		`Warmth: ${warmthLabels[person.warmth]}`,
		`Last contacted: ${lastContacted}`,
		`Next action: ${person.nextAction === '' ? 'none recorded' : person.nextAction}`
	];
}

function describeNote(note: AuthoredNote): string {
	const kind = noteKindLabels[note.kind] ?? noteKindLabels[personNoteKinds.note];
	return `${formatBritishDate(note.createdAt)} — ${kind} by ${note.authorName}:\n${note.body}`;
}

function knownFact(label: string, value: string): string | null {
	if (value === '') return null;
	return `${label}: ${value}`;
}
