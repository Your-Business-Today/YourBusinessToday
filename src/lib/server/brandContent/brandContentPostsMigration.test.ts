import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0188_brand_content_posts.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const destructiveStatement = /\b(?:drop table|drop column|delete from|truncate|alter column|alter table public\.brand_content_pieces|rename|drop constraint|update public)\b/i;

describe('the migration that lets one post go out on several channels', () => {
	it('keeps each post, and each channel as one piece of it, in tables of their own beside the pieces', () => {
		expect(statements).toContain('create table if not exists public.brand_content_posts');
		expect(statements).toContain('create table if not exists public.brand_content_post_channels');
		expect(statements).toContain('content_piece_id uuid primary key');
		expect(statements).toContain('references public.brand_content_pieces (id, organisation_id) on delete restrict');
	});

	it('copies every piece already kept into a post of its own, skipping one already on a post, so it is safe to run twice', () => {
		expect(statements).toMatch(/insert into public\.brand_content_posts[\s\S]*select piece\.id, piece\.organisation_id/);
		expect(statements).toContain('where not exists');
		expect(statements.match(/on conflict \([a-z_]+\) do nothing/g)).toHaveLength(2);
	});

	it('reaches a post only through the brand module, as the pieces are', () => {
		expect(statements.match(/can_use_organisation_module\(organisation_id, 'brand'\)/g)).toHaveLength(4);
	});

	it('deletes, drops and rewrites nothing, and leaves the pieces as they are', () => {
		expect(statements).not.toMatch(destructiveStatement);
	});
});
