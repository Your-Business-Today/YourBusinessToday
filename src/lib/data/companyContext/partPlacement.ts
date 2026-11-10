import { areasOfContext } from './contextAreas';
import { contextPartKind } from './companyContext';
import { partKindNames } from './companyContextWords';
import type { CompanyContextVersion, ContextPart } from './companyContext';

const startsWithAVowel = /^[aeiou]/;

/** What kind of part it is and the area of the business it sits in on the map, as a sentence. */
export function partPlacement(context: CompanyContextVersion, part: ContextPart): string {
	const kindName = partKindNames[part.kind];
	const article = startsWithAVowel.test(kindName) ? 'An' : 'A';
	if (part.kind === contextPartKind.context) return part.isCore ? 'The core area of the business.' : 'An area of the business.';
	const home = areasOfContext(context).find((contextArea) => contextArea.parts.includes(part));
	const area = home?.area ?? null;
	if (area === null) return `${article} ${kindName} not yet linked to an area of the business.`;
	return `${article} ${kindName} in ${area.name}.`;
}
