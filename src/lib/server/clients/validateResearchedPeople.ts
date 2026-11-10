import { companyResearchLimits, type ResearchedPersonFinding } from '$lib/data/companyResearchRules';
import { researchSourceRefusal } from './researchSourceRefusal';
import { trimmedText } from '$lib/data/trimmedText';

const { mostPeople, longestPersonName, longestPersonRole, longestSourceUrl } = companyResearchLimits;

export const peopleRefusal = `Give people as a list of at most ${mostPeople}, each with name, role and sourceUrl.`;

/** The people as given, each checked against the contact they become, or a sentence naming what does not fit. */
export function validateResearchedPeople(value: unknown): ResearchedPersonFinding[] | string {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value) || value.length > mostPeople) return peopleRefusal;
	const people: ResearchedPersonFinding[] = [];
	for (const [index, entry] of value.entries()) {
		const person = validateResearchedPerson(entry);
		if (typeof person === 'string') return `Person ${index + 1}: ${person}`;
		people.push(person);
	}
	return people;
}

function validateResearchedPerson(entry: unknown): ResearchedPersonFinding | string {
	const fields = (entry ?? {}) as Record<string, unknown>;
	const name = trimmedText(fields.name);
	if (name === '' || name.length > longestPersonName) return `The name is 1 to ${longestPersonName} characters.`;
	const role = trimmedText(fields.role);
	if (role.length > longestPersonRole) return `The role is at most ${longestPersonRole} characters.`;
	const sourceUrl = trimmedText(fields.sourceUrl);
	const sourceRefusal = researchSourceRefusal('sourceUrl', sourceUrl, longestSourceUrl);
	if (sourceRefusal !== null) return sourceRefusal;
	return { name, role, sourceUrl };
}
