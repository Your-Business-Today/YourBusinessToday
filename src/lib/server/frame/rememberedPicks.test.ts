import { describe, expect, it } from 'vitest';
import { parseProjectPicks, withProjectPick } from './rememberedPicks';

const harbourId = '11111111-1111-4111-8111-111111111111';
const meadowId = '22222222-2222-4222-8222-222222222222';
const firstProjectId = '33333333-3333-4333-8333-333333333333';
const secondProjectId = '44444444-4444-4444-8444-444444444444';

describe('withProjectPick', () => {
	it('remembers the project picked in each organisation, the latest last', () => {
		const picks = withProjectPick({ [harbourId]: firstProjectId }, meadowId, secondProjectId);
		expect(Object.entries(picks)).toEqual([
			[harbourId, firstProjectId],
			[meadowId, secondProjectId]
		]);
	});

	it('replaces an organisation’s earlier pick and moves it to the end', () => {
		const earlier = { [harbourId]: firstProjectId, [meadowId]: firstProjectId };
		const picks = withProjectPick(earlier, harbourId, secondProjectId);
		expect(Object.entries(picks)).toEqual([
			[meadowId, firstProjectId],
			[harbourId, secondProjectId]
		]);
	});
});

describe('parseProjectPicks', () => {
	it('reads back what was remembered', () => {
		const remembered = JSON.stringify({ [harbourId]: firstProjectId });
		expect(parseProjectPicks(remembered)).toEqual({ [harbourId]: firstProjectId });
	});

	it('forgets anything that is not an organisation’s id paired with a project’s id', () => {
		const tampered = JSON.stringify({ [harbourId]: 'not-a-project', nonsense: firstProjectId, [meadowId]: 7 });
		expect(parseProjectPicks(tampered)).toEqual({});
	});

	it('forgets a cookie that is not an object of picks', () => {
		expect(parseProjectPicks(undefined)).toEqual({});
		expect(parseProjectPicks('{not json')).toEqual({});
		expect(parseProjectPicks('[1,2]')).toEqual({});
	});
});
