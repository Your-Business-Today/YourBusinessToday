import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { newsRelevances, newsSources, newsStoryLimits as limits } from '$lib/data/news/newsStoryRules';

const migration = readFileSync('migrations/0265_business_news_stories.sql', 'utf8');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0265, the stories in Business News and the marks on them, and the limits the connector checks', () => {
	it('holds the same sources, marks and lengths as the rules', () => {
		expect(migration).toContain(`source in (${quotedList(newsSources)})`);
		expect(migration).toContain(`relevance in (${quotedList(newsRelevances)})`);
		expect(migration).toContain(`char_length(headline) between 1 and ${limits.longestHeadline}`);
		expect(migration).toContain(`char_length(link) between 1 and ${limits.longestLink}`);
		expect(migration).toContain(`char_length(match_reason) <= ${limits.longestMatchReason}`);
		expect(migration).toContain(`char_length(note) <= ${limits.longestNote}`);
	});

	it('keeps one story per organisation per link and one mark per person per story', () => {
		expect(migration).toContain('unique (organisation_id, link)');
		expect(migration).toContain('primary key (story_id, account_id)');
	});

	it("lets the organisation's people read and file by the module rule, and keep only their own marks", () => {
		expect(migration).toContain("for select using (public.can_use_organisation_module(organisation_id, 'news'))");
		expect(migration).toContain("with check (public.can_use_organisation_module(organisation_id, 'news') and filed_by = auth.uid())");
		expect(migration).toContain('for all using (account_id = auth.uid())');
	});

	it('keeps no column for the article text', () => {
		expect(migration).not.toMatch(/\b(body|article_text|summary)\b\s+text/);
	});

	it('only adds: it drops no table or column, updates no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
