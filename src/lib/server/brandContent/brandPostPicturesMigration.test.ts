import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0191_brand_post_pictures.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|rename|drop constraint|update public|on delete cascade)\b/i;

describe('the migration that gives a post its picture', () => {
	it('says what picture a post needs in columns that may be empty, beside the post', () => {
		expect(statements).toContain('add column if not exists picture_needed text');
		expect(statements).toContain('add column if not exists picture_expected_from text');
	});

	it('keeps each chosen item in a table of its own, tied to a post and a library item of the same organisation', () => {
		expect(statements).toContain('create table if not exists public.brand_content_post_pictures');
		expect(statements).toContain('references public.brand_content_posts (id, organisation_id) on delete restrict');
		expect(statements).toContain('references public.brand_library_items (id, organisation_id) on delete restrict');
		expect(statements).toContain('unique (post_id, library_item_id)');
	});

	it('reaches a post’s pictures only through the brand module, with no way to update or delete one', () => {
		expect(statements.match(/can_use_organisation_module\(organisation_id, 'brand'\)/g)).toHaveLength(2);
		expect(statements).not.toMatch(/for (?:update|delete|all)\b/);
	});

	it('deletes, drops and rewrites nothing', () => {
		expect(statements).not.toMatch(destructiveStatement);
	});
});
