import { describe, expect, it } from 'vitest';
import { nobodyNamed, salesStandingsOf } from './salesLeaderboard';

const nigel = { id: '11111111-1111-4111-8111-111111111111', name: 'Nigel Reilly' };
const james = { id: '22222222-2222-4222-8222-222222222222', name: 'James Beadle' };

describe('salesStandingsOf', () => {
	it('counts each record for whoever brought it in, as open, won or lost', () => {
		const records = [
			{ ownerId: nigel.id, stage: 'lead' as const },
			{ ownerId: nigel.id, stage: 'prospect' as const },
			{ ownerId: nigel.id, stage: 'lost' as const },
			{ ownerId: james.id, stage: 'client' as const }
		];
		const [first, second] = salesStandingsOf(records, [nigel, james]);
		expect(first).toEqual({ personId: james.id, name: james.name, broughtIn: 1, open: 0, won: 1, lost: 0 });
		expect(second).toEqual({ personId: nigel.id, name: nigel.name, broughtIn: 3, open: 2, won: 0, lost: 1 });
	});

	it('puts the most brought in first when nobody has won more', () => {
		const records = [{ ownerId: nigel.id, stage: 'lead' as const }];
		expect(salesStandingsOf(records, [james, nigel]).map((standing) => standing.name)).toEqual([nigel.name, james.name]);
	});

	it('keeps a salesperson who has brought nothing in yet on the board', () => {
		expect(salesStandingsOf([], [nigel])).toEqual([
			{ personId: nigel.id, name: nigel.name, broughtIn: 0, open: 0, won: 0, lost: 0 }
		]);
	});

	it('gathers records naming nobody on the staff into one line, shown only when there are some', () => {
		const records = [
			{ ownerId: null, stage: 'dormant' as const },
			{ ownerId: '33333333-3333-4333-8333-333333333333', stage: 'lead' as const }
		];
		const unnamed = salesStandingsOf(records, [nigel]).find((standing) => standing.personId === null);
		expect(unnamed).toEqual({ personId: null, name: nobodyNamed, broughtIn: 2, open: 1, won: 1, lost: 0 });
	});
});
