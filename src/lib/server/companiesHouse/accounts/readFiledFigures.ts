import { readIxbrlContexts, readIxbrlFacts, type IxbrlContext, type IxbrlFact } from './ixbrlFacts';
import type { FiledFigures } from '$lib/data/filedFigures';

/** The concepts a balance sheet files under, oldest taxonomy names last; the first found wins. */
const concepts = {
	netAssets: ['NetAssetsLiabilities', 'NetAssetsLiabilitiesIncludingPensionAssetLiability', 'NetAssetsLiabilitiesIncludingPensionAssetLiabilityForStatementOfFinancialPosition'],
	cash: ['CashBankOnHand', 'CashBankInHand'],
	creditors: ['Creditors', 'CreditorsDueWithinOneYear'],
	averageEmployees: ['AverageNumberEmployeesDuringPeriod', 'AverageNumberOfEmployees']
};

/** The latest filed figures in an inline XBRL accounts document: the balance sheet at the made-up date, dimensions set aside. */
export function readFiledFigures(document: string, madeUpTo: string, sourceUrl: string): FiledFigures {
	const facts = readIxbrlFacts(document);
	const contexts = readIxbrlContexts(document);
	const pick = (names: string[]) => firstFound(names, facts, contexts, madeUpTo);
	return {
		netAssets: pick(concepts.netAssets),
		cash: pick(concepts.cash),
		creditors: pick(concepts.creditors),
		averageEmployees: pick(concepts.averageEmployees),
		madeUpTo,
		sourceUrl
	};
}

function firstFound(names: string[], facts: IxbrlFact[], contexts: Map<string, IxbrlContext>, madeUpTo: string): number | null {
	for (const name of names) {
		const value = bestValueOf(facts.filter((fact) => fact.name === name), contexts, madeUpTo);
		if (value !== null) return value;
	}
	return null;
}

type DatedFact = { value: number; endsOn: string; isPlain: boolean };

/** The plain fact for the made-up date first; failing that the latest plain one; failing that any. */
function bestValueOf(facts: IxbrlFact[], contexts: Map<string, IxbrlContext>, madeUpTo: string): number | null {
	if (facts.length === 0) return null;
	const dated = facts.map((fact) => datedFactOf(fact, contexts));
	const plain = dated.filter((fact) => fact.isPlain);
	const atMadeUpDate = plain.find((fact) => fact.endsOn === madeUpTo);
	if (atMadeUpDate !== undefined) return atMadeUpDate.value;
	const [latest] = [...plain].sort((first, second) => second.endsOn.localeCompare(first.endsOn));
	if (latest !== undefined) return latest.value;
	return dated[0].value;
}

function datedFactOf(fact: IxbrlFact, contexts: Map<string, IxbrlContext>): DatedFact {
	const context = contexts.get(fact.contextRef) ?? null;
	if (context === null) return { value: fact.value, endsOn: '', isPlain: false };
	return { value: fact.value, endsOn: context.endsOn, isPlain: !context.hasSegment };
}
