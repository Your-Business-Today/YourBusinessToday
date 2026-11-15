import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0234_brand_picture_makings.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the brand picture migration', () => {
	it('adds the kind of a request and a table of the pictures it made, dropping nothing', () => {
		expect(statements).toContain("add column if not exists kind text not null default 'video' check (kind in ('video', 'pictures'))");
		expect(statements).toContain('create table if not exists public.brand_film_making_pictures');
		expect(statements).toContain('primary key (film_making_id, shot_number)');
		expect(statements).not.toMatch(/drop table|drop column|delete from|truncate|on delete cascade/i);
	});
});
