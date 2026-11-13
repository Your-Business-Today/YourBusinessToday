import { describe, expect, it } from 'vitest';
import { gatesGuarding } from './domainThingLinks';
import { rulePlacesOf } from './domainRulePlaces';
import type { DomainRule } from './domainReading';

const noPlace = { ruleKind: null, guardsStationKeys: [], guardsThingSlug: null, guardsStatus: null, followsEventSlug: null, definesWord: null };
const rule = (facts: Partial<DomainRule>): DomainRule => ({ pageId: 'p', slug: 'r', title: 'R', summary: '', areaSlug: 'a', areaTitle: 'A', governs: [], ...noPlace, ...facts });
const names = { thingTitles: new Map([['order', 'Order'], ['order-paid', 'Order paid']]), stationNames: { 'award-order': 'Award order' } };

describe('rulePlacesOf', () => {
	it('places a rule with no kind on what it governs, as before', () => {
		expect(rulePlacesOf(rule({ governs: ['order'] }), names).map((place) => place.words)).toEqual(['Order']);
	});

	it('places a gate on its stations by name and its record reaching a status, then what else it governs', () => {
		const gate = rule({ ruleKind: 'gate', guardsStationKeys: ['award-order', 'gone'], guardsThingSlug: 'order', guardsStatus: 'Open', governs: ['order', 'quote'] });
		const places = rulePlacesOf(gate, names);
		expect(places.map((place) => place.words)).toEqual(['Award order', 'gone', 'Order reaching Open', 'quote']);
		expect(places[0]).toMatchObject({ stationKey: 'award-order', thingSlug: null });
	});

	it('places a whenever rule on its event and a term on its word', () => {
		expect(rulePlacesOf(rule({ ruleKind: 'whenever', followsEventSlug: 'order-paid' }), names)).toEqual([{ key: 'follows:order-paid', words: 'Order paid', thingSlug: 'order-paid', stationKey: null }]);
		expect(rulePlacesOf(rule({ ruleKind: 'term', definesWord: 'payment terms' }), names).map((place) => place.words)).toEqual(['payment terms']);
	});
});

describe('gatesGuarding', () => {
	it('finds the gates naming a station key', () => {
		const gate = rule({ ruleKind: 'gate', guardsStationKeys: ['award-order'] });
		expect(gatesGuarding([gate, rule({ governs: ['order'] })], 'award-order')).toEqual([gate]);
		expect(gatesGuarding([gate], 'raise-invoice')).toEqual([]);
	});
});
