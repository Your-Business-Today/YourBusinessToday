import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { taskStatusOrder } from '$lib/data/taskStatus';
import { raisingDoctrine } from './raisingDoctrine';
import { showUploadBoxToolName } from './uploadBox/uploadBoxNames';
import { workingDoctrine } from './workingDoctrine';

const actionsDirectory = join(import.meta.dirname, 'actions');
const declaredName = /^\s*name: '([a-z_]+)'/gm;
const guidanceBlock = /guidance:\s*((?:'[^']*'\s*\+?\s*)+)/g;
const snakeCaseName = /(?<![/.])\b[a-z]+(?:_[a-z]+)+\b(?![/.])/g;
const statusWords = new Set<string>(taskStatusOrder);
const toolsTheDoctrineNames = [showUploadBoxToolName];

function actionSources(): { file: string; source: string }[] {
	return readdirSync(actionsDirectory)
		.filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
		.map((file) => ({ file, source: readFileSync(join(actionsDirectory, file), 'utf8') }));
}

function namesIn(text: string): string[] {
	return [...new Set(text.match(snakeCaseName) ?? [])].filter((name) => !statusWords.has(name));
}

describe('the working doctrine', () => {
	const sources = actionSources();
	const actionNames = new Set(
		sources.flatMap(({ source }) => [...source.matchAll(declaredName)].map((match) => match[1]))
	);
	const knownNames = new Set([...actionNames, ...toolsTheDoctrineNames]);

	it('names only actions and tools that exist', () => {
		expect(actionNames.size).toBeGreaterThan(50);
		for (const name of namesIn(workingDoctrine)) expect(knownNames, name).toContain(name);
		for (const name of namesIn(raisingDoctrine)) expect(knownNames, name).toContain(name);
	});

	it('is echoed by guidance that names only actions and tools that exist', () => {
		for (const { file, source } of sources) {
			for (const [, guidance] of source.matchAll(guidanceBlock)) {
				for (const name of namesIn(guidance)) expect(knownNames, `${file} names ${name}`).toContain(name);
			}
		}
	});

	it('sends a file only the person holds through the upload box, never through base64', () => {
		expect(workingDoctrine).toContain(showUploadBoxToolName);
		expect(raisingDoctrine).toContain(showUploadBoxToolName);
		expect(workingDoctrine).toContain('Never type an image or any other file out as base64');
	});

	it('sends every session through the inbox, the task search and the work log', () => {
		expect(workingDoctrine).toContain('read_latest_messages');
		expect(workingDoctrine).toContain('find_tasks');
		expect(workingDoctrine).toContain('FIX: ');
		expect(workingDoctrine).toContain('REFACTOR: round');
	});

	it('sizes a task for one session and ends the session with the chat archivable', () => {
		expect(workingDoctrine).toContain('one session’s work');
		expect(workingDoctrine).toContain('the chat can be archived');
		expect(workingDoctrine).toContain('never for a chat to come back to it');
		expect(raisingDoctrine).toContain('one Claude session');
	});

	it('takes whoever raises something through the search, the shape and the ask', () => {
		expect(raisingDoctrine).toContain('find_goals');
		expect(raisingDoctrine).toContain('find_tasks');
		expect(raisingDoctrine).toContain('FIX: ');
		expect(raisingDoctrine).toContain('ask before creating');
		expect(raisingDoctrine).toContain('what happens next');
	});
});
