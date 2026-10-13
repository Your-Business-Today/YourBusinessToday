import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { toServerErrorRow, type ServerErrorRecord } from './serverErrorRecord';

/**
 * Keeps the error under its reference so it can be looked up later. A failure to keep it is
 * logged and swallowed: the person is already on the error page, and a second failure must
 * not replace the one they are being told about.
 */
export async function recordServerError(record: ServerErrorRecord): Promise<void> {
	try {
		const { error } = await supabaseServiceClient()
			.from('server_errors')
			.upsert(toServerErrorRow(record), { onConflict: 'reference', ignoreDuplicates: true });
		if (error !== null) throw error;
	} catch (failure) {
		console.error(JSON.stringify({ level: 'error', reference: record.reference, recordingFailed: String(failure) }));
	}
}
