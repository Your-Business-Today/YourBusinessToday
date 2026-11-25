import { marked } from 'marked';
import { optionalClausesFor } from '$lib/data/contractOptionalClauses';
import { readOptionalClause } from './readOptionalClause';
import type { OptionalClauseReading } from '$lib/data/optionalClauseReading';

/** The optional clauses a contract template offers, with their text ready to show. */
export async function readOptionalClauseReadings(documentSlug: string): Promise<OptionalClauseReading[]> {
	const clauses = optionalClausesFor(documentSlug);
	return Promise.all(
		clauses.map(async ({ slug, title, summary, isChosenByDefault }) => ({
			slug,
			title,
			summary,
			isChosenByDefault,
			clauseHtml: await marked.parse(readOptionalClause(slug) ?? '')
		}))
	);
}
