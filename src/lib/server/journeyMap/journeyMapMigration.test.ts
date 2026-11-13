import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { commitShape, journeyKeyShape, journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';

const migration = readFileSync('migrations/0211_project_journey_maps.sql', 'utf8');

describe('the columns of migration 0211 and the limits the connector checks', () => {
	it('hold the same lengths', () => {
		const checks = [
			`char_length(route) between 1 and ${limits.routeLength}`,
			`char_length(name) between 1 and ${limits.viewNameLength}`,
			`char_length(purpose) between 1 and ${limits.purposeLength}`,
			`char_length(shows) between 1 and ${limits.showsLength}`,
			`char_length(how) between 1 and ${limits.howLength}`,
			`char_length(arrives_by) between 1 and ${limits.arrivesByLength}`,
			`char_length(journey_key) between 1 and ${limits.keyLength}`,
			`char_length(name) between 1 and ${limits.journeyNameLength}`,
			`char_length(role) between 1 and ${limits.roleLength}`,
			`char_length(story) between 1 and ${limits.storyLength}`,
			`char_length(station_key) between 1 and ${limits.keyLength}`,
			`char_length(does) between 1 and ${limits.doesLength}`,
			`position between 1 and ${limits.mostStepsInAJourney}`
		];
		for (const check of checks) expect(migration).toContain(check);
	});

	it('hold the same shapes for a key and a commit', () => {
		expect(migration).toContain(`journey_key ~ '${journeyKeyShape.source}'`);
		expect(migration).toContain(`station_key ~ '${journeyKeyShape.source}'`);
		expect(migration).toContain(`commit_sha ~ '${commitShape.source}'`);
	});

	it('only adds: no table is dropped, renamed or altered but its own', () => {
		expect(migration).not.toMatch(/\bdrop\s+(table|column)\b/i);
		expect(migration).not.toMatch(/\brename\b/i);
		const altered = [...migration.matchAll(/alter table (public\.\w+)/g)].map((match) => match[1]);
		for (const table of altered) expect(table).toMatch(/^public\.project_site_map_/);
	});
});
