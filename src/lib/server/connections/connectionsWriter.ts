import type { SupabaseClient } from '@supabase/supabase-js';
import { validateConnectionsReading, type CompanyConnection, type ConnectionKind, type ConnectionsReading } from '$lib/data/connectionRules';

const checksTable = 'company_connection_checks';
const connectionsTable = 'company_connections';

export async function getConnectionsReading(supabase: SupabaseClient, companyNumber: string): Promise<ConnectionsReading | null> {
	const { data: check, error } = await supabase.from(checksTable).select('company_number, left_out_officers, checked_at').eq('company_number', companyNumber).maybeSingle();
	if (error) throw error;
	if (check === null) return null;
	const { data: rows, error: rowsError } = await supabase.from(connectionsTable).select('connected_company_number, connected_company_name, kind, through_name').eq('company_number', companyNumber);
	if (rowsError) throw rowsError;
	return { companyNumber, connections: rows.map(parseConnection), leftOutOfficers: (check.left_out_officers ?? []) as string[], checkedAt: check.checked_at as string };
}

/** The one door a company's connections are written by: checked against the columns first, then the company's rows replaced by what was found. */
export async function saveConnectionsReading(supabase: SupabaseClient, reading: ConnectionsReading): Promise<string | null> {
	const refusal = validateConnectionsReading(reading);
	if (refusal !== null) return refusal;
	const { companyNumber } = reading;
	const check = { company_number: companyNumber, left_out_officers: reading.leftOutOfficers, checked_at: reading.checkedAt };
	const { error } = await supabase.from(checksTable).upsert(check, { onConflict: 'company_number' });
	if (error) throw error;
	const { error: clearError } = await supabase.from(connectionsTable).delete().eq('company_number', companyNumber);
	if (clearError) throw clearError;
	const rows = eachConnectionOnce(reading.connections).map((connection) => connectionRowOf(companyNumber, connection));
	if (rows.length === 0) return null;
	const { error: insertError } = await supabase.from(connectionsTable).insert(rows);
	if (insertError) throw insertError;
	return null;
}

export function eachConnectionOnce(connections: CompanyConnection[]): CompanyConnection[] {
	const keyOf = (connection: CompanyConnection) => `${connection.connectedCompanyNumber}|${connection.kind}|${connection.throughName}`;
	return [...new Map(connections.map((connection) => [keyOf(connection), connection])).values()];
}

function connectionRowOf(companyNumber: string, connection: CompanyConnection): Record<string, unknown> {
	return {
		company_number: companyNumber,
		connected_company_number: connection.connectedCompanyNumber,
		connected_company_name: connection.connectedCompanyName,
		kind: connection.kind,
		through_name: connection.throughName
	};
}

function parseConnection(row: Record<string, unknown>): CompanyConnection {
	return {
		connectedCompanyNumber: row.connected_company_number as string,
		connectedCompanyName: (row.connected_company_name ?? '') as string,
		kind: row.kind as ConnectionKind,
		throughName: (row.through_name ?? '') as string
	};
}
