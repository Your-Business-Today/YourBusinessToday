import { describe, expect, it } from 'vitest';
import { actionTools } from '$lib/server/demo/tools/actionTools';
import { DemoKind, demoKinds, type DemoKindValue } from '../demoKinds';
import { findMoneyAndOpportunity } from '../moneyAndOpportunity';
import { seedDemoBusiness } from './seedDemoBusiness';

const today = '2026-10-20';

function figuresOf(kind: DemoKindValue): Record<string, number> {
	const findings = findMoneyAndOpportunity(seedDemoBusiness(kind, today), today);
	return Object.fromEntries(findings.map((finding) => [finding.title, finding.figure]));
}

describe('the demo businesses a prospect can pick', () => {
	it('starts each kind as its own made-up business', () => {
		const names = demoKinds.map((kind) => seedDemoBusiness(kind, today).name);
		expect(new Set(names).size).toBe(demoKinds.length);
		demoKinds.forEach((kind) => expect(seedDemoBusiness(kind, today).kind).toBe(kind));
	});

	it('gives every kind money to find in each of the four places', () => {
		demoKinds.forEach((kind) => expect(Object.keys(figuresOf(kind))).toHaveLength(4));
	});

	it('adds up the bookkeeping practice’s leaks', () => {
		expect(figuresOf(DemoKind.bookkeeping)).toEqual({
			'Work done but not yet invoiced': 4_150,
			'Invoices past their due date': 6_800,
			'Quotes sent and never followed up': 8_400,
			'Subscriptions paid twice, per year': 1_248
		});
	});

	it('starts a copy again as the same kind of business', () => {
		const resetTool = actionTools.find((tool) => tool.name === 'reset_demo');
		const practice = seedDemoBusiness(DemoKind.bookkeeping, today);
		const { changed } = resetTool!.run(practice, today, {});
		expect(changed).toEqual(practice);
	});
});
