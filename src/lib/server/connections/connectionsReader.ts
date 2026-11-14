import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyConnection, ConnectionKind, ConnectionsReading } from '$lib/data/connectionRules';

const numbersPerRead = 200;

export async function getConnectionsReading(supabase: SupabaseClient, companyNumber: string): Promise<ConnectionsReading | null> {
	const readings = await readConnectionsReadings(supabase, [companyNumber]);
	return readings.get(companyNumber) ?? null;
}

/** The kept connections of many companies at once, by company number; a company never checked is absent. */
export async function readConnectionsReadings(supabase: SupabaseClient, companyNumbers: string[]): Promise<Map<string, ConnectionsReading>> {
	const readings = new Map<string, ConnectionsReading>();
	for (let first = 0; first < companyNumbers.length; first += numbersPerRead) {
		const batch = companyNumbers.slice(first, first + numbersPerRead);
		await readBatch(supabase, batch, readings);
	}
	return readings;
}

async function readBatch(supabase: SupabaseClient, batch: string[], readings: Map<string, ConnectionsReading>): Promise<void> {
	const { data: checks, error } = await supabase.from('company_connection_checks').select('company_number, left_out_officers, checked_at').in('company_number', batch);
	if (error) throw error;
	for (const check of checks) {
		const companyNumber = check.company_number as string;
		readings.set(companyNumber, { companyNumber, connections: [], leftOutOfficers: (check.left_out_officers ?? []) as string[], checkedAt: check.checked_at as string });
	}
	const { data: rows, error: rowsError } = await supabase
		.from('company_connections')
		.select('company_number, connected_company_number, connected_company_name, kind, through_name')
		.in('company_number', batch);
	if (rowsError) throw rowsError;
	for (const row of rows) readings.get(row.company_number as string)?.connections.push(parseConnection(row));
}

function parseConnection(row: Record<string, unknown>): CompanyConnection {
	return {
		connectedCompanyNumber: row.connected_company_number as string,
		connectedCompanyName: (row.connected_company_name ?? '') as string,
		kind: row.kind as ConnectionKind,
		throughName: (row.through_name ?? '') as string
	};
}
