/** Someone a message could be addressed to: their account id, name and email. */
type Addressable = { id: string; name: string; email: string };

const greeting = /^(hi|hello|hey|dear|morning|afternoon|evening)\s+/i;
const nameSeparators = /[\s@.]+/;
const longestOpeningInWords = 3;
const questionMark = '?';

/**
 * Who a message that asks something is written to, when it opens by naming one of them ("Hi James,"
 * or "Nigel, can you…"): an ask its writer posted without saying whom it waits on. Nobody when it
 * asks nothing, opens without a name, or the name fits nobody or more than one person.
 */
export function addressedPerson<Person extends Addressable>(body: string, people: Person[], writerId: string): Person | null {
	if (!body.includes(questionMark)) return null;
	const opening = openingNameOf(body);
	if (opening === null) return null;
	const named = people.filter((person) => person.id !== writerId && isCalled(person, opening));
	if (named.length !== 1) return null;
	return named[0];
}

function openingNameOf(body: string): string | null {
	const [firstLine] = body.trim().split('\n');
	if (!firstLine.includes(',')) return null;
	const [beforeComma] = firstLine.split(',');
	const opening = beforeComma.replace(greeting, '').trim().toLowerCase();
	const wordCount = opening.split(/\s+/).length;
	if (opening === '' || wordCount > longestOpeningInWords) return null;
	return opening;
}

function isCalled(person: Addressable, opening: string): boolean {
	if (person.name.toLowerCase() === opening) return true;
	const nameWords = `${person.name} ${person.email}`.toLowerCase().split(nameSeparators);
	return nameWords.includes(opening);
}
