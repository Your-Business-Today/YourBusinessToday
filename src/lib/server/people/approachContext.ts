import { formatBritishDate } from '$lib/data/britishDate';
import { headcountBandLabels } from '$lib/data/headcountBands';
import { clientStageLabels } from '$lib/data/clientLifecycle';
import { seniorityLabels, warmthLabels } from '$lib/data/contactProfileFields';
import type { PersonCompany } from './getCompaniesForPerson';
import type { PersonInFull } from './getPerson';

const nothingRecorded = '(nothing recorded)';

export function describeCompanyForApproach(company: PersonCompany): string {
	const profile = company.profile;
	return [
		`Company: ${company.name}`,
		`Their part in it: ${company.officerRole || company.role || nothingRecorded}`,
		`Our standing: ${clientStageLabels[company.stage]}`,
		`Website: ${company.website || nothingRecorded}`,
		`Industry: ${profile.industry || nothingRecorded}`,
		`Location: ${profile.location || nothingRecorded}`,
		`Size: ${headcountBandLabels[profile.headcountBand]}`,
		`Profile: ${profile.summary || nothingRecorded}`,
		`Opening angles: ${profile.openingAngles || nothingRecorded}`
	].join('\n');
}

export function describePersonForApproach(person: PersonInFull): string {
	return [
		`Name: ${person.name}`,
		`Seniority: ${seniorityLabels[person.seniority]}`,
		`Decision maker: ${person.isDecisionMaker ? 'yes' : 'not known to be'}`,
		`Warmth: ${warmthLabels[person.warmth]}`,
		`Last contacted: ${person.lastContactedOn === null ? 'never' : formatBritishDate(person.lastContactedOn)}`,
		`Next action: ${person.nextAction || nothingRecorded}`,
		`Links: ${describeLinks(person)}`,
		`Notes, newest first:\n${describeNotes(person)}`
	].join('\n');
}

function describeLinks(person: PersonInFull): string {
	const { links } = person;
	if (links.length === 0) return nothingRecorded;
	return links.map((link) => `${link.label} ${link.url}`).join(', ');
}

function describeNotes(person: PersonInFull): string {
	const { notes } = person;
	if (notes.length === 0) return nothingRecorded;
	return notes
		.map((note) => `- ${formatBritishDate(note.createdAt)}, ${note.authorName}: ${note.body}`)
		.join('\n');
}
