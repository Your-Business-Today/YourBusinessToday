import type { SupabaseClient } from '@supabase/supabase-js';
import { connectionsFreshForDays, type ConnectionsReading } from '$lib/data/connectionRules';
import { daysAgo } from '$lib/data/days';
import { findCompanyConnections } from './findCompanyConnections';
import { getConnectionsReading } from './connectionsReader';
import { saveConnectionsReading } from './connectionsWriter';

/** A company's connections as they stand now: the stored ones while fresh, else found again and kept. A refusal is the reason they could not be kept. */
export async function currentConnections(supabase: SupabaseClient, companyNumber: string, suppressed: Set<string>): Promise<ConnectionsReading | string> {
	const stored = await getConnectionsReading(supabase, companyNumber);
	if (stored !== null && isFresh(stored)) return stored;
	const reading = await findCompanyConnections(companyNumber, suppressed);
	const refusal = await saveConnectionsReading(supabase, reading);
	return refusal ?? reading;
}

function isFresh(reading: ConnectionsReading): boolean {
	return reading.checkedAt.slice(0, 10) >= daysAgo(connectionsFreshForDays);
}
