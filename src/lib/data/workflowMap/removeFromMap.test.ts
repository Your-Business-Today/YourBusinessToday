import { describe, expect, it } from 'vitest';
import { amendWorkflowMap } from './amendWorkflowMap';
import { amended, amendableMap, amendment, noRemovals, plainStation, refusalOf, stationKeysOf } from './tests/amendableMap';
import { lineKind } from './workflowMap';

const removing = (removals: Partial<typeof noRemovals>) => ({ remove: { ...noRemovals, ...removals } });

describe('removing from a workflow map and adding lines to it', () => {
	it('removes a station with the hand-overs and arrivals that touch it, and says which went', () => {
		const { draft, changes } = amended(removing({ stationKeys: ['call', 'claim'] }));
		expect(stationKeysOf(draft).sales).toEqual(['bill-audit-offer']);
		expect(draft.handovers.map((handover) => handover.toKey)).toEqual(['check-bills']);
		expect(draft.arrivals).toEqual([]);
		expect(changes.removed).toEqual(['station "call"', 'station "claim"']);
		expect(changes.removedWith).toEqual(['arrival of "Market data" at call', 'hand-over claim to share-invoice']);
	});

	it('adds a line with its stations and the hand-over to it in one amendment', () => {
		const onboarding = { key: 'onboarding', name: 'Onboarding', kind: lineKind.role };
		const headroom = { station: plainStation('credit-headroom'), lineKey: 'onboarding', afterKey: null };
		const handover = { fromKey: 'bill-audit-offer', toKey: 'credit-headroom', handedOver: 'New customer', goesWrong: null };
		const { draft, changes } = amended({ lines: [onboarding], stations: [headroom], handovers: [handover] });
		expect(stationKeysOf(draft).onboarding).toEqual(['credit-headroom']);
		expect(draft.handovers).toHaveLength(3);
		const added = ['line "onboarding"', 'station "credit-headroom" on line "onboarding"', 'hand-over bill-audit-offer to credit-headroom'];
		expect(changes.added).toEqual(added);
	});

	it('refuses to remove a line that still holds stations, and removes it once they have moved', () => {
		expect(refusalOf(removing({ lineKeys: ['finance'] }))).toContain('line "finance" still holds one station');
		const moved = { station: plainStation('share-invoice'), lineKey: 'bill-analyst', afterKey: null };
		const { draft } = amended({ stations: [moved], ...removing({ lineKeys: ['finance'] }) });
		expect(draft.lines.map((line) => line.key)).toEqual(['sales', 'bill-analyst']);
	});

	it('refuses a key to remove or to follow that the map does not hold, by name', () => {
		expect(refusalOf(removing({ stationKeys: ['meter-read'] }))).toBe('The map holds no station "meter-read" to remove.');
		const stranger = { station: plainStation('switch-supply'), lineKey: 'sales', afterKey: 'check-bills' };
		expect(refusalOf({ stations: [stranger] })).toContain('follows "check-bills", which is not another station on the line "sales"');
		expect(refusalOf({ stations: [{ station: plainStation('switch-supply'), lineKey: null, afterKey: null }] })).toContain('is new');
		expect(refusalOf(removing({ handovers: [{ fromKey: 'call', toKey: 'claim' }] }))).toContain('no hand-over call to claim');
	});

	it('leaves the latest version it was given untouched', () => {
		const latest = amendableMap();
		amendWorkflowMap(latest, amendment(removing({ stationKeys: ['call'] })));
		expect(latest).toEqual(amendableMap());
	});
});
