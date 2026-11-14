import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0232_brand_content_music.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the brand content music migration', () => {
	it('adds the one music column, naming a library item, and drops nothing', () => {
		expect(statements).toContain('add column if not exists music_item_id uuid references public.brand_library_items (id) on delete restrict');
		expect(statements).not.toMatch(/drop |delete from|truncate|on delete cascade/i);
	});
});
