import { domainFilingLimits, type DomainFilingGiven } from '$lib/data/businessBrainDomainRules';
import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { validateBusinessBrainSource } from './validateBusinessBrainSource';
import { validateDomainContext, validateDomainPageWrite, validateDomainRetire } from './validateDomainEntries';

const { mostContexts, mostPages, mostRetires } = domainFilingLimits;

type EntryCheck<Entry> = (entry: PlainObject, label: string) => Entry | string;

/** What one source teaches about the domain, every value checked, or a sentence naming the first that does not fit. */
export function validateDomainFiling(input: PlainObject): DomainFilingGiven | string {
	const source = validateBusinessBrainSource(input);
	if (typeof source === 'string') return source;
	const contexts = validateList(input.contexts, 'contexts', mostContexts, validateDomainContext);
	if (typeof contexts === 'string') return contexts;
	const pages = validateList(input.pages, 'pages', mostPages, validateDomainPageWrite);
	if (typeof pages === 'string') return pages;
	const retires = validateList(input.retires, 'retires', mostRetires, validateDomainRetire);
	if (typeof retires === 'string') return retires;
	const filing = { source, contexts, pages, retires };
	return filingRefusal(filing) ?? filing;
}

function validateList<Entry>(given: unknown, listName: string, most: number, check: EntryCheck<Entry>): Entry[] | string {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > most) return `The ${listName} are a list of at most ${most} from one source.`;
	const entries: Entry[] = [];
	for (const [index, entry] of given.entries()) {
		const checked = check(isPlainObject(entry) ? entry : {}, `${listName} ${index + 1}`);
		if (typeof checked === 'string') return checked;
		entries.push(checked);
	}
	return entries;
}

/** Why the filing does not hold together, or null when it does. */
function filingRefusal({ contexts, pages, retires }: DomainFilingGiven): string | null {
	const writtenSlugs = [...contexts, ...pages].map((written) => written.slug);
	const repeatedSlug = writtenSlugs.find((slug, index) => writtenSlugs.indexOf(slug) !== index);
	if (repeatedSlug !== undefined) return `The slug ${repeatedSlug} is written twice; one concept is one page.`;
	const coreContexts = contexts.filter((context) => context.isCoreDomain);
	if (coreContexts.length > 1) return 'Exactly one context is the core domain; mark only one with isCoreDomain.';
	const pageSlugs = pages.map((page) => page.slug);
	const unfolded = retires.find((retire) => !pageSlugs.includes(retire.foldedIntoSlug));
	if (unfolded !== undefined) return `Retiring ${unfolded.slug} folds its knowledge into a page written in this same call; ${unfolded.foldedIntoSlug} is not one.`;
	const rewritten = retires.find((retire) => writtenSlugs.includes(retire.slug));
	if (rewritten !== undefined) return `${rewritten.slug} is written and retired in the same call; do one or the other.`;
	return null;
}
