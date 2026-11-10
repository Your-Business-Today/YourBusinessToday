import type { SupabaseClient } from '@supabase/supabase-js';
import { checkConnector } from '$lib/server/mcp/selfCheck/checkConnector';
import { WatchCheckFailure } from './watchCheckFailure';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const connectorSelfCheckSourceName = 'connector_self_check';

/** Knocked after every production deploy: the connector checks itself against the live database, reading only. */
export const connectorSelfCheckSource: WatchSource = {
	name: connectorSelfCheckSourceName,
	summary: 'checks the deployed connector keeps the pipeline contract and answers its reads against the live database',
	run: runSelfCheck
};

async function runSelfCheck(supabase: SupabaseClient): Promise<WatchOutcome> {
	const { callsMade, failures } = await checkConnector(supabase);
	if (failures.length === 0) return passedOutcome(callsMade);
	throw new WatchCheckFailure(`The connector failed its self-check: ${failures.join('; ')}.`);
}

function passedOutcome(callsMade: number): WatchOutcome {
	const note = `The connector keeps the pipeline contract and answered all ${callsMade} of its reads.`;
	return { rowsWritten: 0, resumeMarker: new Date().toISOString(), note, isFinished: true };
}
