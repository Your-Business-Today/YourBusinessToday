import { describe, expect, it } from 'vitest';
import { batonStations } from './batonStations';
import type { ConversationTurn } from '$lib/data/conversationTurn';

const names: Record<string, string> = { james: 'James', dan: 'Dan' };
const nameOf = (accountId: string) => names[accountId];

const claudeAskedDan: ConversationTurn = {
	authorAccountId: 'james',
	postedVia: 'claude',
	awaiting: { accountId: 'dan', kind: 'person' },
	pickedUpAt: null,
	since: '2026-09-27T09:00:00Z'
};

function stationStates(turn: ConversationTurn): string[] {
	return batonStations(turn, nameOf, 'james').map((station) => `${station.label}:${station.state}`);
}

describe('the baton relay', () => {
	it('runs from the writer’s Claude to the awaited person, not yet picked up', () => {
		expect(stationStates(claudeAskedDan)).toEqual([
			'You:passed',
			'Your Claude:spoke',
			'Dan’s Claude:next',
			'Dan:next'
		]);
	});

	it('puts the baton with the person once their Claude has brought it to them', () => {
		const pickedUp = { ...claudeAskedDan, pickedUpAt: '2026-09-27T10:00:00Z' };
		expect(stationStates(pickedUp).slice(-2)).toEqual(['Dan’s Claude:passed', 'Dan:holding']);
	});

	it('stops at their Claude when it can answer on its own, and skips a Claude nobody used', () => {
		const onTheSite = { ...claudeAskedDan, postedVia: 'site' as const };
		const forClaude = { ...onTheSite, awaiting: { accountId: 'dan', kind: 'claude' as const } };
		expect(stationStates(forClaude)).toEqual(['You:spoke', 'Dan’s Claude:next']);
	});

	it('has no relay when nobody is waiting', () => {
		expect(batonStations({ ...claudeAskedDan, awaiting: null }, nameOf, 'james')).toEqual([]);
	});
});
