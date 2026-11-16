import { describe, expect, it } from 'vitest';
import { leadQuoteActions } from './leadQuoteActions';
import { leadQuoteRefusals } from '$lib/server/leadQuotes/validateLeadQuote';
import type { McpCaller } from '../resolveMcpCaller';

const callerWithNoDatabase = { accountId: 'james', supabase: {} } as unknown as McpCaller;
const clientId = '11111111-1111-4111-8111-111111111111';

function actionNamed(name: string) {
	const action = leadQuoteActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action ${name}`);
	return action;
}

describe('the lead quote actions', () => {
	it('are for staff, on the clients area, one writing and one reading', () => {
		expect(leadQuoteActions.map(({ name, area, audience, isWrite }) => ({ name, area, audience, isWrite }))).toEqual([
			{ name: 'file_lead_quote', area: 'clients', audience: 'staff', isWrite: true },
			{ name: 'read_lead_quote', area: 'clients', audience: 'staff', isWrite: false }
		]);
	});

	it('tells a Claude to take every figure from the rates sheet or the person, and to give the whole quote', () => {
		const guidance = actionNamed('file_lead_quote').guidance ?? '';
		expect(guidance).toContain('Rate card');
		expect(guidance).toContain('never from you');
		expect(guidance).toContain('read_lead_quote first');
	});

	it('refuses a quote that does not fit before it reaches the database', async () => {
		const answer = await actionNamed('file_lead_quote').run(callerWithNoDatabase, { clientId, title: 'Plan', preparedOn: '2026-11-17', lines: [] });
		expect(answer).toBe(leadQuoteRefusals.lines);
	});

	it('refuses a version that is not a version number, and a client id that is not an id', async () => {
		const read = actionNamed('read_lead_quote');
		expect(await read.run(callerWithNoDatabase, { clientId, version: 'latest' })).toContain('whole number');
		expect(await read.run(callerWithNoDatabase, { clientId: 'Conservaqua' })).toContain('clientId');
	});
});
