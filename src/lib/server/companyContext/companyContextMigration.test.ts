import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextStages } from '$lib/data/companyContext/companyContext';

const migration = readFileSync('migrations/0154_company_contexts.sql', 'utf8');
const reviewsMigration = readFileSync('migrations/0163_company_context_part_reviews.sql', 'utf8');
const confirmationsMigration = readFileSync('migrations/0170_company_context_confirmations.sql', 'utf8');
const lastClientEventKinds = readFileSync('migrations/0150_client_set_up_event.sql', 'utf8');

describe('the columns of migration 0154 and the limits the connector checks', () => {
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

	it("hold the same length for what is wrong on a client's mark, and only right and not right", () => {
		expect(reviewsMigration).toContain(`char_length(what_is_wrong) between 1 and ${limits.whatIsWrongLength}`);
		expect(reviewsMigration).toContain("review_state in ('right', 'not_right')");
	});

	it('keeps one confirmation per version, and lets the client history record it beside every kind it held', () => {
		expect(confirmationsMigration).toContain('version_id uuid primary key references public.company_context_versions');
		const kindsBefore = [...lastClientEventKinds.matchAll(/^\t\t'([a-z_]+)'/gm)].map((match) => match[1]);
		expect(kindsBefore.length).toBeGreaterThan(0);
		for (const kind of [...kindsBefore, 'context_confirmed']) expect(confirmationsMigration).toContain(`'${kind}'`);
	});
});
