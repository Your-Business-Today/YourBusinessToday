import type { PersonCompany } from '../getCompaniesForPerson';
import type { PersonInFull } from '../getPerson';

const nothingRecorded = '(nothing recorded)';

export function personResearchBrief(person: PersonInFull, companies: PersonCompany[]): string {
	return [
		`Find the public business presence of ${person.name}.`,
		'',
		describePerson(person),
		'',
		`Their companies (${companies.length}):`,
		...companies.map(describeCompany)
	].join('\n\n');
}

function describePerson(person: PersonInFull): string {
	return [
		`Name: ${person.name}`,
		`Companies House officer id: ${person.officerId ?? nothingRecorded}`,
		`Links we hold: ${person.links.map((link) => `${link.label} ${link.url}`).join(', ') || nothingRecorded}`,
		`What our staff have noted: ${person.notes.map((note) => note.body).join(' / ') || nothingRecorded}`
	].join('\n');
}

function describeCompany(company: PersonCompany): string {
	const profile = company.profile;
	return [
		`Company: ${company.name} (${profile.companyNumber || 'no number'})`,
		`Their part in it: ${company.officerRole || company.role || nothingRecorded}`,
		`Website: ${company.website || nothingRecorded}`,
		`Industry: ${profile.industry || nothingRecorded}`,
		`Where: ${[profile.location, profile.postcode].filter(Boolean).join(', ') || nothingRecorded}`
	].join('\n');
}
