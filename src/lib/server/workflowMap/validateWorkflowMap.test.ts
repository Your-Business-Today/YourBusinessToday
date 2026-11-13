import { describe, expect, it } from 'vitest';
import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { juneWorkflowMapInput } from './juneMap/juneWorkflowMap';
import { validateWorkflowMap } from './validateWorkflowMap';

type Station = Record<string, unknown>;
type Line = { key: string; stations: Station[] };

function juneWith(change: (lines: Line[], input: Record<string, unknown>) => void): Record<string, unknown> {
	const input = juneWorkflowMapInput();
	change(input.lines as Line[], input);
	return input;
}

function refusalOf(input: Record<string, unknown>): string {
	const reading = validateWorkflowMap(input);
	return 'refusal' in reading ? reading.refusal : '';
}

describe('validateWorkflowMap', () => {
	it('reads the June map whole, with its three outputs and every station done elsewhere', () => {
		const reading = validateWorkflowMap(juneWorkflowMapInput());
		if ('refusal' in reading) throw new Error(reading.refusal);
		const stations = reading.lines.flatMap((line) => line.stations);
		expect(stations.filter((station) => station.isOutput).map((station) => station.key)).toEqual(['pvr', 'cvr', 'cashflow-forecast']);
		expect(new Set(stations.map((station) => station.state))).toEqual(new Set(['elsewhere']));
	});

	it('refuses a value longer than its column, naming the field and the limit', () => {
		const input = juneWith((lines) => (lines[0].stations[0].name = 'x'.repeat(limits.nameLength + 1)));
		expect(refusalOf(input)).toBe(`Station "subbie-onboarding" name is too long: keep it to ${limits.nameLength} characters.`);
	});

	it('refuses an email address or a phone number', () => {
		const input = juneWith((lines) => (lines[1].stations[0].summary = 'Ring the office on 01483 555 0101 to open it.'));
		expect(refusalOf(input)).toContain('Station "project-setup" summary holds an email address or a phone number');
	});

	it('refuses a key that is not lower-case words joined by hyphens', () => {
		const input = juneWith((lines) => (lines[2].stations[0].key = 'Tender Received'));
		expect(refusalOf(input)).toContain('Line "quantity-surveyor" station 1 key must be lower-case words joined by hyphens');
	});

	it('refuses a station key given twice across the map', () => {
		const input = juneWith((lines) => (lines[3].stations[0].key = 'pvr'));
		expect(refusalOf(input)).toBe('The station key "pvr" is given twice: a station sits on one line, once.');
	});

	it('refuses a hand-over between two stations of one line, or to a station not on the map', () => {
		const sameLine = juneWith((_lines, input) => (input.handovers = [{ fromKey: 'pvr', toKey: 'cvr', handedOver: 'Period valuation' }]));
		expect(refusalOf(sameLine)).toContain('joins two stations of the line "quantity-surveyor"');
		const stray = juneWith((_lines, input) => (input.handovers = [{ fromKey: 'pvr', toKey: 'payroll', handedOver: 'Wages' }]));
		expect(refusalOf(stray)).toBe('Hand-over 1 toKey "payroll" is not the key of a station on this map.');
	});

	it('refuses a product on a station done elsewhere, and a thing that is not a slug', () => {
		const productId = '121925ec-bf29-46a2-bd62-374f3ca05648';
		const elsewhere = juneWith((lines) => (lines[0].stations[0].productId = productId));
		expect(refusalOf(elsewhere)).toContain('Station "subbie-onboarding" is done elsewhere, so it names no product');
		const thing = juneWith((lines) => (lines[0].stations[0].producesThings = ['Compliance File']));
		expect(refusalOf(thing)).toContain('producesThings "Compliance File" must be a Domain thing\'s slug');
	});

	it('refuses a stage that is neither before nor after, and a map with no lines', () => {
		expect(refusalOf({ ...juneWorkflowMapInput(), stage: 'during' })).toBe('stage must be one of: before, after.');
		expect(refusalOf({ stage: 'after', lines: [] })).toBe('lines is missing: give every role, each with its stations.');
	});
});
