/** What a territory's register holds: the month its placed companies were last seen, and how many it holds placed or not. */
export type TerritoryRegister = { asAtMonth: string | null; companiesHeld: number };

const howItFills = 'It fills itself overnight, or at once when you ask your Claude to pull its companies.';
const howTheyArePlaced = 'They are placed overnight, or at once when you ask your Claude to geocode the register postcodes.';

/** Why a territory's map shows no register companies yet and what puts them there, or null when it shows them. */
export function registerNotOnMapSentence(register: TerritoryRegister): string | null {
	const isOnTheMap = register.asAtMonth !== null;
	if (isOnTheMap) return null;
	const { companiesHeld } = register;
	const holdsNone = companiesHeld < 1;
	if (holdsNone) return `No companies are loaded for this territory yet. ${howItFills}`;
	return `${companiesHeld.toLocaleString('en-GB')} companies are loaded for this territory and none is placed on the map yet. ${howTheyArePlaced}`;
}
