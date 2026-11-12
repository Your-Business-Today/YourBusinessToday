import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { PostgrestError } from '@supabase/supabase-js';

/** Whose pages a reading or a filing touches: the organisation's own when projectId is null, else one product's. */
export type DomainScope = { organisationId: string; projectId: string | null };

/** The organisation's own pages, those no product holds. */
export const organisationOwnPages: Pick<DomainScope, 'projectId'> = { projectId: null };

/** A PostgREST filter, as column, operator and value, narrowing a reading of pages to a scope's. */
export type ScopeFilter = [column: string, operator: string, value: string | null];

type Answer<Data> = { data: Data; error: PostgrestError | null };

const productColumn = 'project_id';
/** A filter every page passes. */
export const everyPage: ScopeFilter = ['id', 'not.is', null];

/**
 * Runs a reading of the scope's pages, the reading applying the filter it is handed. Until migration 0203 adds
 * the product column no page belongs to a product, so the organisation's reading runs with a filter every page
 * passes and a product's answers null, holding none.
 */
export async function readAnswerInScope<Result extends { error: PostgrestError | null }>(
	scope: Pick<DomainScope, 'projectId'>,
	read: (filter: ScopeFilter) => PromiseLike<Result>
): Promise<Result | null> {
	const narrowed = await read(scopeFilterOf(scope));
	if (!isSchemaNotYetMigrated(narrowed.error)) return answerOf(narrowed);
	if (scope.projectId !== null) return null;
	return answerOf(await read(everyPage));
}

/** The data of a reading of the scope's pages, as readAnswerInScope runs it. */
export async function readInScope<Data>(
	scope: Pick<DomainScope, 'projectId'>,
	read: (filter: ScopeFilter) => PromiseLike<Answer<Data>>
): Promise<Data | null> {
	const answer = await readAnswerInScope(scope, read);
	return answer === null ? null : answer.data;
}

function scopeFilterOf({ projectId }: Pick<DomainScope, 'projectId'>): ScopeFilter {
	if (projectId === null) return [productColumn, 'is', null];
	return [productColumn, 'eq', projectId];
}

function answerOf<Result extends { error: PostgrestError | null }>(answer: Result): Result {
	if (answer.error) throw answer.error;
	return answer;
}

/** The product column of a new page in the scope: none for the organisation's own, so it files before 0203 runs. */
export function productColumnOf({ projectId }: Pick<DomainScope, 'projectId'>): { project_id?: string } {
	return projectId === null ? {} : { project_id: projectId };
}
