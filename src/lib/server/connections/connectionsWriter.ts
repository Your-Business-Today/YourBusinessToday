import type { SupabaseClient } from '@supabase/supabase-js';
import { validateConnectionsReading, type CompanyConnection, type ConnectionsReading } from '$lib/data/connectionRules';

const checksTable = 'company_connection_checks';
const connectionsTable = 'company_connections';

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
