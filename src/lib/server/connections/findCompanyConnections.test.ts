import { afterEach, describe, expect, it, vi } from 'vitest';
import { appointmentItem, companiesHouseOver, companyControlItem, officerItem, personControlItem } from './connectionsWorld.fixture';
import { describeConnections } from '$lib/data/connectionsAnswer';
import { findCompanyConnections } from './findCompanyConnections';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const target = '11111111';
const janeBorn = { month: 4, year: 1975 };
const noneSuppressed = new Set<string>();

const world = {
	officers: {
		[target]: [
			officerItem('jane', 'SMITH, Jane Mary', 'director', janeBorn),
			officerItem('agent', 'FORMATIONS, Nominee', 'director', { month: 1, year: 1960 }),
			officerItem('sec', 'CLERK, Sam', 'secretary', { month: 2, year: 1980 })
		]
	},
	appointments: {
		jane: { items: [appointmentItem(target, 'Target Ltd'), appointmentItem('22222222', 'Smith Holdings Ltd'), appointmentItem('33333333', 'Other Board Ltd')] },
		agent: { items: [appointmentItem('44444444', 'Shell Ltd')], activeCount: 400 }
	},
	control: {
		[target]: [companyControlItem('5555555', 'Parent Group Ltd')],
		'22222222': [personControlItem('Jane', 'Smith', janeBorn)],
		'33333333': [personControlItem('Jane', 'Smith', { month: 9, year: 1990 })]
	}
};

afterEach(() => vi.unstubAllGlobals());

describe('finding who is behind a company', () => {
	it('finds the company that owns it, and each director company owned or only sat on', async () => {
		vi.stubGlobal('fetch', companiesHouseOver(world));
		const reading = await findCompanyConnections(target, noneSuppressed);
		expect(reading.connections).toEqual([
			{ connectedCompanyNumber: '05555555', connectedCompanyName: 'Parent Group Ltd', kind: 'owns_this_company', throughName: '' },
			{ connectedCompanyNumber: '22222222', connectedCompanyName: 'Smith Holdings Ltd', kind: 'director_owns', throughName: 'Jane Mary Smith' },
			{ connectedCompanyNumber: '33333333', connectedCompanyName: 'Other Board Ltd', kind: 'director_sits', throughName: 'Jane Mary Smith' }
		]);
	});

	it('leaves out an officer with too many appointments, by name, and never the secretary', async () => {
		vi.stubGlobal('fetch', companiesHouseOver(world));
		const reading = await findCompanyConnections(target, noneSuppressed);
		expect(reading.leftOutOfficers).toEqual(['Nominee Formations']);
		expect(reading.connections.some((connection) => connection.connectedCompanyNumber === '44444444')).toBe(false);
		expect(describeConnections(reading)).toContain('Left out as formation agents or nominees: Nominee Formations.');
	});

	it('skips a suppressed company', async () => {
		vi.stubGlobal('fetch', companiesHouseOver(world));
		const reading = await findCompanyConnections(target, new Set(['22222222']));
		expect(reading.connections.map((connection) => connection.connectedCompanyNumber)).toEqual(['05555555', '33333333']);
	});

	it('answers with no connection when the record links none', async () => {
		vi.stubGlobal('fetch', companiesHouseOver({ officers: {}, appointments: {}, control: {} }));
		const reading = await findCompanyConnections('99999999', noneSuppressed);
		expect(describeConnections(reading)).toContain('99999999: no connected company on record.');
	});
});
