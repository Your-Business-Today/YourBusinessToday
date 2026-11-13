import { salesRegisterSegments } from '$lib/data/salesRegisters';
import type { ParamMatcher } from '@sveltejs/kit';

/** A company's page sits under one of the two registers, so /leads/<id> and /clients/<id> are one page. */
export const match: ParamMatcher = (param) => salesRegisterSegments.includes(param);
