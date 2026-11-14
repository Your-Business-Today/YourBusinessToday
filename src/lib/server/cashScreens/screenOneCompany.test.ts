import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cashOf, connectedThrough, leastCash, screenedNumber } from '$lib/data/cashScreenEvidence.fixture';
import { connectionKinds, type ConnectionsReading } from '$lib/data/connectionRules';
import type { AccountsReading } from '$lib/data/accountsReadingRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const readingsRead: string[] = [];
let readings: Record<string, AccountsReading> = {};
let connections: ConnectionsReading | null = null;

vi.mock('$lib/server/companiesHouse/accounts/currentAccountsReading', () => ({
	currentAccountsReading: async (_supabase: unknown, companyNumber: string) => {
		readingsRead.push(companyNumber);
		return readings[companyNumber];
	}
}));
vi.mock('$lib/server/connections/currentConnections', () => ({ currentConnections: async () => connections }));

const { screenOneCompany } = await import('./screenOneCompany');
const supabase = {} as SupabaseClient;

function withConnected(...kinds: [string, keyof typeof connectionKinds][]): ConnectionsReading {
	const reading = connectedThrough(connectionKinds.directorOwns);
	const template = reading.connections[0];
	const listed = kinds.map(([companyNumber, kind]) => ({ ...template, connectedCompanyNumber: companyNumber, kind: connectionKinds[kind] }));
	return { ...reading, connections: listed };
}

describe('reading one company for a screen', () => {
	beforeEach(() => {
		readingsRead.length = 0;
		connections = null;
	});

	it('reads nothing more when its own cash passes', async () => {
		readings = { [screenedNumber]: cashOf(screenedNumber, 200_000) };
		await screenOneCompany(supabase, screenedNumber, leastCash, new Set());
		expect(readingsRead).toEqual([screenedNumber]);
	});

	it('reads the companies it owns before those a director only sits on, stopping at the first that passes', async () => {
		readings = { [screenedNumber]: cashOf(screenedNumber, 1_000), '00000009': cashOf('00000009', 1_000), '00000008': cashOf('00000008', 500_000), '00000007': cashOf('00000007', 1) };
		connections = withConnected(['00000009', 'directorSits'], ['00000008', 'directorOwns'], ['00000007', 'ownsThisCompany']);
		await screenOneCompany(supabase, screenedNumber, leastCash, new Set());
		expect(readingsRead).toEqual([screenedNumber, '00000008']);
	});
});
