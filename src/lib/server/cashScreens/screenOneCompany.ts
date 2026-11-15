import type { SupabaseClient } from '@supabase/supabase-js';
import { connectionKinds, type CompanyConnection } from '$lib/data/connectionRules';
import { currentAccountsReading } from '$lib/server/companiesHouse/accounts/currentAccountsReading';
import { currentConnections } from '$lib/server/connections/currentConnections';
import { hasCashOf, ownedKinds } from '$lib/data/cashScreenOutcome';

/**
 * Reads what a screen needs to know about one company and keeps it: its own accounts, and only when its own cash falls
 * short, who is behind it and their accounts, the companies it owns or that own it first, stopping at the first that passes.
 */
export async function screenOneCompany(supabase: SupabaseClient, companyNumber: string, leastCash: number, suppressed: Set<string>): Promise<void> {
	const own = await currentAccountsReading(supabase, companyNumber);
	const isOwnCashEnough = typeof own !== 'string' && hasCashOf(own, leastCash);
	if (isOwnCashEnough) return;
	const connections = await currentConnections(supabase, companyNumber, suppressed);
	if (typeof connections === 'string') return;
	for (const connection of ownedFirst(connections.connections)) {
		const reading = await currentAccountsReading(supabase, connection.connectedCompanyNumber);
		const isOwned = ownedKinds.includes(connection.kind);
		const isPassingOwner = isOwned && typeof reading !== 'string' && hasCashOf(reading, leastCash);
		if (isPassingOwner) return;
	}
}

function ownedFirst(connections: CompanyConnection[]): CompanyConnection[] {
	const satOn = connections.filter((connection) => connection.kind === connectionKinds.directorSits);
	const owned = connections.filter((connection) => connection.kind !== connectionKinds.directorSits);
	const ownedNumbers = new Set(owned.map((connection) => connection.connectedCompanyNumber));
	return [...owned, ...satOn.filter((connection) => !ownedNumbers.has(connection.connectedCompanyNumber))];
}
