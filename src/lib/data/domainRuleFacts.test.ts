import { describe, expect, it } from 'vitest';
import { readEventFacts, readRuleFacts } from './domainRuleFacts';

describe('reading a rule’s and an event’s facts', () => {
	it('reads a rule’s kind and where it sits, an unknown kind as none, and a status only beside its record', () => {
		const facts = readRuleFacts({ ruleKind: 'gate', guardsStationKeys: ['award', 3], guardsStatus: 'Open', followsEventSlug: '' });
		expect(facts).toEqual({ ruleKind: 'gate', guardsStationKeys: ['award'], guardsThingSlug: null, guardsStatus: null, followsEventSlug: null, definesWord: null });
		expect(readRuleFacts({ ruleKind: 'policy' }).ruleKind).toBeNull();
	});

	it('reads what an event marks and who reacts, and an event filed before these as marking nothing', () => {
		const facts = readEventFacts({ marksThingSlug: 'order', marksStatus: 'Paid', reactors: { roles: ['Clerk'], ruleSlugs: 'raise' } });
		expect(facts).toEqual({ marksThingSlug: 'order', marksStatus: 'Paid', reactors: { roles: ['Clerk'], ruleSlugs: [] } });
		expect(readEventFacts({})).toEqual({ marksThingSlug: null, marksStatus: null, reactors: { roles: [], ruleSlugs: [] } });
	});
});
