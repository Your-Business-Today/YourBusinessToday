import { describe, expect, it } from 'vitest';
import {
	attachedSummary,
	outcomes,
	refusalBeforeSending,
	renamedIfFromClipboard,
	uploadDescriptionOf,
	uploadPageIn
} from './boxFiles.js';
import { fileOfSize, openBox } from './boxStandIns';
import { uploadBoxSentence } from '$lib/server/mcp/uploadBox/uploadBoxSentence';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

describe('a file the box is given', () => {
	it('is described by its name and type, and by a general type when it has none', () => {
		const described = uploadDescriptionOf(fileOfSize(4, 'grid.png'));
		expect(described).toEqual({ filename: 'grid.png', mimeType: 'image/png', byteCount: 4 });
		const untyped = uploadDescriptionOf(fileOfSize(4, 'export.dat', ''));
		expect(untyped.mimeType).toBe('application/octet-stream');
	});

	it('is refused before anything is sent when it is empty or over the limit', () => {
		expect(refusalBeforeSending(openBox, fileOfSize(0, 'empty.png'))?.outcome).toBe(outcomes.refused);
		const tooLarge = refusalBeforeSending(openBox, fileOfSize(openBox.largestFileBytes + 1, 'film.mov'));
		expect(tooLarge?.reason).toContain('25.0 MB');
		expect(refusalBeforeSending(openBox, fileOfSize(1024, 'photo.jpg'))).toBeNull();
	});

	it('is named for when it was pasted, when the clipboard called it image.png', () => {
		const pastedAt = new Date('2026-10-08T12:13:14.000Z');
		const renamed = renamedIfFromClipboard(fileOfSize(8, 'image.png'), pastedAt);
		expect(renamed.name).toBe('pasted-image-2026-10-08-121314.png');
		expect(renamed.size).toBe(8);
		expect(renamed.type).toBe('image/png');
		expect(renamedIfFromClipboard(fileOfSize(8, 'site-plan.png'), pastedAt).name).toBe('site-plan.png');
	});
});

describe('what the box and Claude tell each other', () => {
	it('finds the upload page in the words Claude was given', () => {
		const task = { title: openBox.taskTitle } as ProjectTask;
		const address = 'https://yourbusiness.today/upload/AbC_d-9.xY_z-0';
		expect(uploadPageIn(uploadBoxSentence(task, address))).toBe(address);
		expect(uploadPageIn('No task has that id.')).toBeNull();
	});

	it('tells Claude which files arrived, and how to see them', () => {
		const attachedFiles = [
			{ filename: 'grid.png', size: '412 KB' },
			{ filename: 'brief.pdf', size: '1.2 MB' }
		];
		const summary = attachedSummary(openBox.taskTitle, attachedFiles);
		expect(summary).toContain('grid.png (412 KB), brief.pdf (1.2 MB)');
		expect(summary).toContain(openBox.taskTitle);
		expect(summary).toContain('read_task');
	});
});
