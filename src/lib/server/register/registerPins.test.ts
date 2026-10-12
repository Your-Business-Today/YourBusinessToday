import { describe, expect, it } from 'vitest';
import { companiesAtOneAddressThatMakeAHub } from '$lib/data/registerRules';
import { pinsForRegister } from './registerPins';
import type { LocatedRegisterCompany } from './registerCompanyRecord';

const kingston = { latitude: 51.41, longitude: -0.3 };

function company(number: string, overrides: Partial<LocatedRegisterCompany> = {}): LocatedRegisterCompany {
	return {
		companyNumber: number,
		name: `Company ${number}`,
		registeredAddress: `${number} Eden Street`,
		postcode: 'KT1 1EU',
		outcode: 'KT1',
		sector: 'KT1 1',
		companyStatus: 'Active',
		incorporatedOn: '2021-11-18',
		accountCategory: 'MICRO ENTITY',
		sicCodes: ['41202'],
		nextAccountsDue: '',
		nextStatementDue: '',
		chargeCount: 0,
		firstSeenMonth: '2026-10-01',
		lastSeenMonth: '2026-10-01',
		isGone: false,
		sourceUrl: '',
		figures: null,
		statusNote: '',
		indicators: null,
		filingsCheckedAt: null,
		latitude: 51.411,
		longitude: -0.301,
		...overrides
	};
}

describe('pinsForRegister', () => {
	it('draws one pin per company, carrying our standing and whether it trades', () => {
		const standings = new Map([['2', { clientId: 'client-2', stage: 'lead' as const }]]);
		const dormant = company('3', { accountCategory: 'DORMANT' });
		const { pins, companyCount, nonTradingCount } = pinsForRegister([company('1'), company('2'), dormant], kingston, 3, standings);
		expect(companyCount).toBe(3);
		expect(nonTradingCount).toBe(1);
		expect(pins.map((pin) => pin.key)).toEqual(['1', '2', '3']);
		expect(pins[1].standing).toEqual({ clientId: 'client-2', stage: 'lead' });
		expect(pins[2].isNonTrading).toBe(true);
	});

	it('folds the companies at an agent address into one hub pin, and leaves out companies beyond the radius', () => {
		const residents = Array.from({ length: companiesAtOneAddressThatMakeAHub }, (unused, index) =>
			company(`hub-${index}`, { registeredAddress: 'Argent House' })
		);
		const farAway = company('far', { latitude: 53.48, longitude: -2.24 });
		const { pins, hubCount, companyCount } = pinsForRegister([...residents, company('near'), farAway], kingston, 3, new Map());
		expect(hubCount).toBe(1);
		expect(companyCount).toBe(residents.length + 1);
		const hub = pins.find((pin) => pin.companyCount > 1);
		expect(hub?.companyCount).toBe(companiesAtOneAddressThatMakeAHub);
		expect(hub?.companyNumber).toBe('');
		expect(pins.some((pin) => pin.key === 'far')).toBe(false);
	});
});
