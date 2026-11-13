import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stationMarkStates } from '$lib/data/workflowMap/stationReview';
import { stationReviewLimits as limits } from '$lib/data/workflowMap/stationReviewLimits';

const migration = readFileSync('migrations/0212_workflow_map_station_reviews.sql', 'utf8');

describe('the columns of migration 0212 and the limits both doors check', () => {
	it('holds what is wrong to the same length', () => {
		expect(migration).toContain(`char_length(what_is_wrong) between 1 and ${limits.whatIsWrongLength}`);
	});

	it('allows the two marks a client makes, and only those', () => {
		expect(migration).toContain(`review_state in (${stationMarkStates.map((state) => `'${state}'`).join(', ')})`);
	});

	it('only adds: it alters, drops and copies from no existing table', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!workflow_map_station_reviews)/);
		expect(migration).not.toMatch(/\bdrop\b/);
		expect(migration).not.toMatch(/\b(update|delete from|insert into)\b/);
	});
});
