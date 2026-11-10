import { describe, expect, it } from 'vitest';
import { estimateTakeHome } from './takeHomeEstimate';
import { employedOn, selfEmployedOn } from './takeHomeTestInputs';

const incomeTaxOnSalary = (salary: number) => estimateTakeHome(employedOn(salary)).incomeTaxTotal;

describe('income tax, England, Wales and Northern Ireland', () => {
	it('is nothing at the £12,570 personal allowance', () => {
		expect(incomeTaxOnSalary(12570)).toBe(0);
	});

	it('is £6,486 at £45,000 (20% of £32,430)', () => {
		expect(incomeTaxOnSalary(45000)).toBe(6486);
	});

	it('is £7,540 at £50,270, the top of the basic rate band (20% of £37,700)', () => {
		expect(incomeTaxOnSalary(50270)).toBe(7540);
	});

	it('is £27,432 at £100,000 (£7,540 + 40% of £49,730)', () => {
		expect(incomeTaxOnSalary(100000)).toBe(27432);
	});

	it('is £33,432 at £110,000: the allowance tapers to £7,570 but the basic band stays £37,700', () => {
		const estimate = estimateTakeHome(employedOn(110000));
		expect(estimate.personalAllowanceUsed).toBe(7570);
		expect(estimate.incomeTaxTotal).toBe(33432);
	});

	it('is £42,516 at £125,140 and £44,703 at £130,000', () => {
		expect(incomeTaxOnSalary(125140)).toBe(42516);
		expect(incomeTaxOnSalary(130000)).toBe(44703);
	});

	it('keeps the allowance for a single pound over £100,000, because it goes £1 for every whole £2', () => {
		expect(estimateTakeHome(employedOn(100001)).personalAllowanceUsed).toBe(12570);
		expect(estimateTakeHome(employedOn(100002)).personalAllowanceUsed).toBe(12569);
	});
});

describe('income tax, Scotland', () => {
	it('is £6,882.05 at £45,000 in 2026/27 (19% of £3,967 + 20% of £12,989 + 21% of £14,136 + 42% of £1,338)', () => {
		expect(estimateTakeHome(employedOn(45000, { taxRegion: 'scotland' })).incomeTaxTotal).toBe(6882.05);
	});

	it('is £6,913.80 at £45,000 in 2025/26 (19% of £2,827 + 20% of £12,094 + 21% of £16,171 + 42% of £1,338)', () => {
		const estimate = estimateTakeHome(employedOn(45000, { taxRegion: 'scotland', taxYear: '2025/26' }));
		expect(estimate.incomeTaxTotal).toBe(6913.8);
	});
});

describe('pension relief at source for the self-employed', () => {
	it('moves £6,000 of a £60,000 profit from 40% to 20% when 10% goes into a pension: £10,232 not £11,432', () => {
		const estimate = estimateTakeHome(selfEmployedOn(60000, { pensionPercentage: 10 }));
		expect(estimate.incomeTaxTotal).toBe(10232);
		expect(estimate.pensionCost).toBe(4800);
	});
});
