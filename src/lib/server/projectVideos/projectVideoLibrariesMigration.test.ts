import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VideoLibraries, videoLibraryNames } from '$lib/projectVideos/videoLibraries';

const migration = readFileSync('migrations/0267_project_video_libraries.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the project video libraries migration', () => {
	it('adds the library as a column, every video already kept a tutorial', () => {
		expect(statements).toContain(`add column if not exists library text not null default '${VideoLibraries.tutorials}'`);
		expect(statements).not.toMatch(/drop |rename /);
	});

	it('holds the library to the names the app checks', () => {
		const names = videoLibraryNames.map((library) => `'${library}'`).join(', ');
		expect(statements).toContain(`check (library in (${names}))`);
	});
});
