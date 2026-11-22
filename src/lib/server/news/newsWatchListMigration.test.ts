import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { organisationModules } from '$lib/data/organisationModules';
import { watchedKinds, watchedValuePatterns, watchListLimits as limits } from '$lib/data/news/watchListRules';

const migration = readFileSync('migrations/0264_business_news_watch_list.sql', 'utf8');
const { sector_code: sectorCodePattern, company: companyPattern } = watchedValuePatterns;
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');
const modulesUpToNews = organisationModules.slice(0, organisationModules.indexOf('news') + 1);

describe('migration 0264, Business News and its watch list, and the limits the site and the connector check', () => {
	it('lets every module up to news be switched on, news among them', () => {
		expect(migration).toContain(`check (module in (${quotedList(modulesUpToNews)}))`);
	});

	it('holds the same kinds, lengths and shapes as the rules', () => {
		expect(migration).toContain(`kind in (${quotedList(watchedKinds)})`);
		expect(migration).toContain(`char_length(value) between 1 and ${limits.longestValue}`);
		expect(migration).toContain(`char_length(label) <= ${limits.longestLabel}`);
		expect(migration).toContain(`kind <> 'sector_code' or value ~ '${sectorCodePattern?.source}'`);
		expect(migration).toContain(`kind <> 'company' or value ~ '${companyPattern?.source}'`);
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
