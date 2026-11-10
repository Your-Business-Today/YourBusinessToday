import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from '$lib/server/mcp/actionRegistry';
import type { AccountStanding } from '$lib/server/mcp/resolveAccountStanding';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const deletingWords = /delete|remove|erase|purge|destroy/i;
const boardroomSources = ['src/lib/server/boardroom', 'src/routes/organisations/[organisationId]/boardroom'];

function sourceFilesUnder(folder: string): string[] {
	return readdirSync(folder, { recursive: true, encoding: 'utf8' })
		.filter((name) => /\.(ts|svelte)$/.test(name) && !name.endsWith('.test.ts'))
		.map((name) => join(folder, name));
}

function boardroomMigrations(): string[] {
	const files = readdirSync('migrations').filter((name) => name.endsWith('.sql'));
	const texts = files.map((name) => readFileSync(join('migrations', name), 'utf8').replace(/--.*$/gm, ''));
	return texts.filter((text) => text.includes('public.boardroom_'));
}

describe('nothing in Boardroom is deleted, by anyone, on the site or through the connector', () => {
	it('offers no connector action that deletes or removes anything', () => {
		const boardroomActions = actionsFor(anAdministrator, null).filter((action) => action.module === 'boardroom');
		expect(boardroomActions.map((action) => action.name)).toContain('write_board_minutes');
		expect(boardroomActions.filter((action) => deletingWords.test(action.name)).map((action) => action.name)).toEqual([]);
	});

	it('never deletes a row or a stored paper in its server code or its pages', () => {
		const files = boardroomSources.flatMap(sourceFilesUnder);
		expect(files.length).toBeGreaterThan(0);
		expect(files.filter((file) => readFileSync(file, 'utf8').includes('.delete(') || readFileSync(file, 'utf8').includes('.remove('))).toEqual([]);
	});

	it('lets no policy, grant or cascade delete a Boardroom row in any migration', () => {
		const migrations = boardroomMigrations();
		expect(migrations.length).toBeGreaterThan(0);
		for (const text of migrations) {
			expect(text).not.toMatch(/for (delete|all)\b/i);
			expect(text).not.toMatch(/grant[^;]*\bdelete\b/i);
			expect(text).not.toMatch(/on delete cascade/i);
		}
	});
});
