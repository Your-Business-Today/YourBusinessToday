import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextStages } from '$lib/data/companyContext/companyContext';

const migration = readFileSync('migrations/0151_company_contexts.sql', 'utf8');

describe('the columns of migration 0151 and the limits the connector checks', () => {
	it('hold the same lengths', () => {
		const checks = [
			`char_length(part_key) between 1 and ${limits.keyLength}`,
			`char_length(name) between 1 and ${limits.nameLength}`,
			`char_length(description) between 1 and ${limits.descriptionLength}`,
			`char_length(seen_in_connector) between 1 and ${limits.connectorLength}`,
			`char_length(seen_at_place) between 1 and ${limits.placeLength}`,
			`char_length(what_is_wrong) between 1 and ${limits.whatIsWrongLength}`,
			`char_length(description) between 1 and ${limits.stepLength}`,
			`position between 1 and ${limits.mostStepsInAProcess}`
		];
		for (const check of checks) expect(migration).toContain(check);
	});

	it('allow every step of the offer as a stage, and only those', () => {
		for (const stage of contextStages) expect(migration).toContain(`'${stage}'`);
	});
});
