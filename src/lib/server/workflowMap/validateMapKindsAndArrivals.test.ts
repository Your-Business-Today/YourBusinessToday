import { describe, expect, it } from 'vitest';
import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { juneWorkflowMapInput } from './juneMap/juneWorkflowMap';
import { validateWorkflowMap } from './validateWorkflowMap';

type Line = { key: string; kind?: string };

const enquiry = { whatArrives: 'Subcontractor enquiry', arrivesFrom: 'a subcontractor', stationKey: 'subbie-onboarding' };

function juneWithKinds(kinds: string[], arrivals: unknown[]): Record<string, unknown> {
	const input = juneWorkflowMapInput();
	(input.lines as Line[]).forEach((line, index) => (line.kind = kinds[index]));
	return { ...input, arrivals };
}

function refusalOf(input: Record<string, unknown>): string {
	const reading = validateWorkflowMap(input);
	return 'refusal' in reading ? reading.refusal : '';
}

describe('a line kind and what arrives from outside, as the connector reads them', () => {
	it('reads every line as a role and nothing arriving when a map gives neither', () => {
		const reading = validateWorkflowMap(juneWorkflowMapInput());
		if ('refusal' in reading) throw new Error(reading.refusal);
		expect(new Set(reading.lines.map((line) => line.kind))).toEqual(new Set(['role']));
		expect(reading.arrivals).toEqual([]);
	});

	it('reads each line kind given and each arrival in the order filed', () => {
		const reading = validateWorkflowMap(juneWithKinds(['outside_party', 'system'], [enquiry]));
		if ('refusal' in reading) throw new Error(reading.refusal);
		expect(reading.lines.map((line) => line.kind).slice(0, 3)).toEqual(['outside_party', 'system', 'role']);
		expect(reading.arrivals).toEqual([enquiry]);
	});

	it('refuses a kind that is not a role, an outside party or a system, by name', () => {
		const input = juneWithKinds(['supplier'], []);
		expect(refusalOf(input)).toBe('Line "compliance" kind must be one of: role, outside_party, system.');
	});

	it('refuses an arrival that names no station on the map, by name', () => {
		const input = juneWithKinds([], [{ ...enquiry, stationKey: 'take-enquiry' }]);
		expect(refusalOf(input)).toBe(
			'Arrival 1 stationKey "take-enquiry" is not the key of a station on this map: name the station it starts.'
		);
	});

	it('refuses an arrival that says neither what arrives nor where from', () => {
		expect(refusalOf(juneWithKinds([], [{ ...enquiry, whatArrives: '' }]))).toContain('Arrival 1 whatArrives');
		expect(refusalOf(juneWithKinds([], [{ ...enquiry, arrivesFrom: undefined }]))).toContain('Arrival 1 arrivesFrom');
	});

	it('refuses an arrival longer than its column, and one given twice', () => {
		const tooLong = juneWithKinds([], [{ ...enquiry, arrivesFrom: 'x'.repeat(limits.arrivesFromLength + 1) }]);
		expect(refusalOf(tooLong)).toBe(`Arrival 1 arrivesFrom is too long: keep it to ${limits.arrivesFromLength} characters.`);
		const twice = juneWithKinds([], [enquiry, { ...enquiry, arrivesFrom: 'a supplier' }]);
		expect(refusalOf(twice)).toBe('Arrival 2 repeats "Subcontractor enquiry" at subbie-onboarding: give each once.');
	});

	it('refuses more arrivals than a version holds', () => {
		const many = Array.from({ length: limits.mostArrivals + 1 }, (_, index) => ({ ...enquiry, whatArrives: `Enquiry ${index}` }));
		expect(refusalOf(juneWithKinds([], many))).toContain('arrivals');
	});
});
