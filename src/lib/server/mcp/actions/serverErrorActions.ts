import { findServerError } from '$lib/server/serverErrors/findServerError';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { ServerErrorRecord } from '$lib/server/serverErrors/serverErrorRecord';

const referencePattern = /^[0-9a-f]{8}$/;

export const serverErrorActions: McpAction[] = [
	{
		name: 'read_server_error',
		area: 'support',
		audience: 'admin',
		isWrite: false,
		summary: 'what failed behind a "Something went wrong (ref …)" page: the page, the person, the error and where it was thrown',
		inputSchema: objectSchema({ reference: textField('The eight-character reference the error page showed, such as 7cf957d8') }, ['reference']),
		run: async (caller, input) => {
			const reference = readText(input, 'reference').toLowerCase();
			if (!referencePattern.test(reference)) return 'A reference is the eight letters and digits after "ref" on the error page, such as 7cf957d8.';
			const record = await findServerError(caller.supabase, reference);
			if (record === null) return `No error is recorded under ${reference}. Errors before the record was kept are only in the Vercel logs.`;
			return describeServerError(record);
		}
	}
];

function describeServerError(record: ServerErrorRecord): string {
	const page = `${record.method} ${record.pathname} (route ${record.routeId ?? 'unmatched'})`;
	return [
		`Reference ${record.reference}, ${formatBritishDateTime(record.occurredAt)}, status ${record.status}`,
		`Page: ${page}`,
		`Signed in as: ${record.userId ?? 'nobody'}`,
		`Error: ${record.causeMessage}`,
		`Where: ${record.causeStack ?? 'no stack recorded'}`
	].join('\n');
}
