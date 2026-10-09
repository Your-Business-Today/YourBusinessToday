import { isUuid } from '$lib/data/isUuid';
import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Postgres raises on a malformed uuid before RLS can answer 'not found', so
 * routes keyed by id match only real uuids and let everything else 404.
 */
export const match: ParamMatcher = (param) => isUuid(param);
