import { describe, expect, it } from 'vitest';
import { validateEventFacts } from './validateEventFacts';

const label = 'pages 2';

describe('validateEventFacts', () => {
	it('gives nothing for an event filed with neither what it marks nor who reacts, as before', () => {
		expect(validateEventFacts({}, label)).toBeNull();
		expect(validateEventFacts({ reactors: { roles: [], ruleSlugs: [] } }, label)).toBeNull();
	});

	it('keeps what an event marks and who reacts as given', () => {
		const given = { marksThingSlug: 'contract-stack', marksStatus: 'Signed', reactors: { roles: ['Accounts clerk'], ruleSlugs: ['raise-first-invoice'] } };
		expect(validateEventFacts(given, label)).toEqual(given);
		expect(validateEventFacts({ reactors: { roles: ['Director'] } }, label)).toEqual({ reactors: { roles: ['Director'], ruleSlugs: [] } });
		expect(validateEventFacts({ marksThingSlug: 'job' }, label)).toEqual({ marksThingSlug: 'job' });
	});

	it('refuses a status with no record, a record that is not a slug, and reactors that do not fit', () => {
		expect(validateEventFacts({ marksStatus: 'Signed' }, label)).toBe('pages 2: marksStatus is a status of the record named in marksThingSlug, so it comes with it.');
		expect(validateEventFacts({ marksThingSlug: 'Contract stack' }, label)).toContain('pages 2: marksThingSlug. The slug is');
		expect(validateEventFacts({ reactors: ['Director'] }, label)).toContain('reactors says who reacts');
		expect(validateEventFacts({ reactors: { ruleSlugs: ['Raise invoice'] } }, label)).toContain('reactors says who reacts');
		expect(validateEventFacts({ reactors: { roles: ['Director', 'Director'] } }, label)).toContain('each given once');
	});
});
