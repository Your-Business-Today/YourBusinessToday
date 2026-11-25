import { blanksIn, findContractBlank, blankSources, type BlankSource } from '$lib/data/contractBlanks';
import { optionalClausesFor, type ContractOptionalClause } from '$lib/data/contractOptionalClauses';
import { readOptionalClause } from '$lib/server/clientDocuments/readOptionalClause';

const sourceWords: Record<BlankSource, string> = {
	[blankSources.organisation]: 'from the client organisation’s details',
	[blankSources.quote]: 'from the lead’s quote',
	[blankSources.pack]: 'written into the pack'
};

/** The blanks a template holds, each with where a client's pack fills it from. */
export function describeContractBlanks(markdown: string): string {
	const labels = blanksIn(markdown);
	if (labels.length === 0) return 'Blanks to fill: none.';
	return ['Blanks to fill, each in square brackets:', ...labels.map(describeBlank)].join('\n');
}

function describeBlank(label: string): string {
	const blank = findContractBlank(label);
	return `- [${label}] — ${sourceWords[blank?.source ?? blankSources.pack]}`;
}

/** The clauses kept apart from a template's standard text, which a pack chooses or leaves out. */
export function describeOptionalClauses(documentSlug: string): string {
	const clauses = optionalClausesFor(documentSlug);
	if (clauses.length === 0) return 'Optional clauses: none.';
	return ['Optional clauses, chosen per client:', ...clauses.map(describeOptionalClause)].join('\n\n');
}

function describeOptionalClause(clause: ContractOptionalClause): string {
	const chosen = clause.isChosenByDefault ? 'chosen unless left out' : 'left out unless chosen';
	const needs = clause.needsClause === undefined ? '' : `, only with ${clause.needsClause}`;
	const heading = `${clause.title} (clause ${clause.slug}, ${chosen}${needs}) — ${clause.summary}`;
	return `${heading}\n\n${readOptionalClause(clause.slug) ?? ''}`;
}
