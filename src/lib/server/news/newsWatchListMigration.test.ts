import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { organisationModules } from '$lib/data/organisationModules';
import { watchedKinds, watchedValuePatterns, watchListLimits as limits } from '$lib/data/news/watchListRules';

const migration = readFileSync('migrations/0264_business_news_watch_list.sql', 'utf8');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0264, Business News and its watch list, and the limits the site and the connector check', () => {
	it('lets every module be switched on, news among them', () => {
		expect(migration).toContain(`check (module in (${quotedList(organisationModules)}))`);
	});

	it('holds the same kinds, lengths and shapes as the rules', () => {
		expect(migration).toContain(`kind in (${quotedList(watchedKinds)})`);
		expect(migration).toContain(`char_length(value) between 1 and ${limits.longestValue}`);
		expect(migration).toContain(`char_length(label) <= ${limits.longestLabel}`);
		expect(migration).toContain(`kind <> 'sector_code' or value ~ '${watchedValuePatterns.sector_code?.source}'`);
		expect(migration).toContain(`kind <> 'company' or value ~ '${watchedValuePatterns.company?.source}'`);
		expect(migration).toContain('unique (organisation_id, kind, value)');
	});

	it("lets the organisation's people read it by the module rule and only staff change it", () => {
		expect(migration).toContain("for select using (public.can_use_organisation_module(organisation_id, 'news'))");
		expect(migration).toContain('for all using (public.is_project_manager()) with check (public.is_project_manager())');
	});

	it('only adds: it drops no table or column, updates no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
