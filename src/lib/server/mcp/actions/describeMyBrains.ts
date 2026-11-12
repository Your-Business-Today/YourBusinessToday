import { businessBrainPartNames } from '$lib/data/businessBrainRules';
import { countOf } from '$lib/data/countOf';
import { myBrainsLimits, type BrainPageFound, type BrainSearched } from '$lib/data/myBrainsRules';

export const noBrainToSearch =
	'You reach no brain yet: no organisation you are on has Your Business Brain switched on, no chatbot names you, and no product you are on has a brain.';

/** The brains that hold something on the words, most pages first, then those that hold nothing. */
export function describeMyBrains(searchText: string, brains: BrainSearched[]): string {
	if (brains.length === 0) return noBrainToSearch;
	const holding = brains.filter(({ pagesFound }) => pagesFound.length > 0).sort(byPagesThenName);
	const silent = brains.filter(({ pagesFound }) => pagesFound.length === 0).map(({ name }) => name);
	const heading = `# Brains you reach that hold something on "${searchText}": ${holding.length} of ${brains.length}`;
	const sections = holding.flatMap((brain, position) => ['', ...brainSection(brain, position)]);
	const silentLine = silent.length === 0 ? [] : ['', `Nothing on it in: ${silent.join(', ')}.`];
	const advice = ['', 'Read the pages that bear on the question in the brain that holds them, and answer only from what they say.'];
	return [heading, ...sections, ...silentLine, ...advice].join('\n');
}

function brainSection(brain: BrainSearched, position: number): string[] {
	const { pagesFound, purpose } = brain;
	const shown = pagesFound.slice(0, myBrainsLimits.mostPagesShownPerBrain);
	const forLine = purpose === '' ? [] : [`For: ${purpose}`];
	const heading = `## ${position + 1}. ${brain.name}: ${countOf(pagesFound.length, 'page')}`;
	return [heading, ...forLine, ...shown.flatMap(pageLines), `Read on with ${brain.readOnWith}.`];
}

function pageLines(page: BrainPageFound): string[] {
	const heading = `- **${page.title}** — ${businessBrainPartNames[page.partKind]}, ${page.kind}, page id ${page.pageId}`;
	if (page.excerpt === '') return [heading];
	return [heading, `  > ${page.excerpt}`];
}

function byPagesThenName(left: BrainSearched, right: BrainSearched): number {
	const byPages = pageCountOf(right) - pageCountOf(left);
	if (byPages !== 0) return byPages;
	return left.name.localeCompare(right.name);
}

function pageCountOf({ pagesFound }: BrainSearched): number {
	return pagesFound.length;
}
