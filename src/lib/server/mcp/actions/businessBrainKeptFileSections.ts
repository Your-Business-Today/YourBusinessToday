import { countOf } from '$lib/data/countOf';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import type { KeptBusinessBrainFile, KeptBusinessBrainFiles } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';

/** The action that opens a kept file, named wherever a file is listed. */
export const openKeptFileAction = 'open_business_brain_file';

const howToOpen = `Open one with ${openKeptFileAction} and its file id.`;

function fileLine(file: KeptBusinessBrainFile): string {
	return `- **${file.filename}** (${file.mimeType}, ${describeByteCount(file.byteCount)}, file id ${file.fileId})`;
}

/** The files a page was written from, or nothing when it names none. */
export function pageFilesSection(files: KeptBusinessBrainFile[]): string[] {
	if (files.length === 0) return [];
	return ['', `## Source files: ${countOf(files.length, 'file')}`, ...files.map(fileLine), howToOpen];
}

/** How many files the brain keeps, and every one no page names yet, so none is out of reach. */
export function keptFilesSection(kept: KeptBusinessBrainFiles): string[] {
	const { keptCount, unnamed, unnamedCount } = kept;
	if (keptCount === 0) return [];
	const heading = `## Kept files: ${countOf(keptCount, 'file')}`;
	if (unnamedCount === 0) return ['', heading, `Each is listed on the page written from it. ${howToOpen}`];
	const unlisted = unnamedCount - unnamed.length;
	const cutNote = unlisted > 0 ? [`${countOf(unlisted, 'more unnamed file')} not listed.`] : [];
	const unnamedLine = `${countOf(unnamedCount, 'file')} no page names yet, latest first; the rest are listed on the pages written from them:`;
	return ['', heading, unnamedLine, ...unnamed.map(fileLine), ...cutNote, howToOpen];
}
