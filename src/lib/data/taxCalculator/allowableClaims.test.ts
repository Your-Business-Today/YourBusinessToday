import { describe, expect, it } from 'vitest';
import { claimHomeWorking, claimMileage } from './allowableClaims';
import { rulesFor } from './taxYearRules';

const mileageRulesFor2025To2026 = rulesFor('2025/26').mileage;
const mileageRulesFor2026To2027 = rulesFor('2026/27').mileage;

describe('claimMileage', () => {
	it('pays 55p a mile for a car or van in 2026/27: 8,000 miles is £4,400', () => {
		expect(claimMileage('carOrVan', 8000, mileageRulesFor2026To2027).amount).toBe(4400);
	});

	it('pays 45p a mile for a car or van in 2025/26: 8,000 miles is £3,600', () => {
		expect(claimMileage('carOrVan', 8000, mileageRulesFor2025To2026).amount).toBe(3600);
	});

	it('drops to 25p after 10,000 miles: 12,000 miles is £5,500 + £500 in 2026/27', () => {
		const claim = claimMileage('carOrVan', 12000, mileageRulesFor2026To2027);
		expect(claim.portions.map((portion) => portion.amount)).toEqual([5500, 500]);
		expect(claim.amount).toBe(6000);
	});

	it('pays 24p a mile on a motorcycle and 20p on a bicycle', () => {
		expect(claimMileage('motorcycle', 1000, mileageRulesFor2026To2027).amount).toBe(240);
		expect(claimMileage('bicycle', 1000, mileageRulesFor2026To2027).amount).toBe(200);
	});

	it('claims nothing without a vehicle', () => {
		expect(claimMileage('none', 5000, mileageRulesFor2026To2027)).toEqual({ portions: [], amount: 0 });
	});
});

describe('claimHomeWorking', () => {
	it('claims nothing under 25 hours a month', () => {
		expect(claimHomeWorking('under25Hours', rulesFor('2026/27').homeWorking).amount).toBe(0);
	});

	it('claims £10, £18 or £26 a month by band', () => {
		const homeWorkingRules = rulesFor('2026/27').homeWorking;
		expect(claimHomeWorking('25To50Hours', homeWorkingRules).amount).toBe(120);
		expect(claimHomeWorking('51To100Hours', homeWorkingRules).amount).toBe(216);
		expect(claimHomeWorking('101HoursOrMore', homeWorkingRules).amount).toBe(312);
	});
});
