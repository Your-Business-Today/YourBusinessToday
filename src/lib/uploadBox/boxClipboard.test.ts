import { afterEach, describe, expect, it, vi } from 'vitest';
import { clipboardReadings, pasteKeysHere, readClipboardImages } from './boxClipboard.js';

type ClipboardEntry = { types: string[]; getType: (type: string) => Promise<Blob> };

const pastedAt = new Date('2026-10-08T15:46:07.000Z');
const pictureBytes = [137, 80, 78, 71, 0, 255, 16];
const macintosh = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
const windows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

function entryOf(...types: string[]): ClipboardEntry {
	const getType = async (type: string) => new Blob([new Uint8Array(pictureBytes)], { type });
	return { types, getType };
}

function withClipboard(read: () => Promise<ClipboardEntry[]>) {
	vi.stubGlobal('navigator', { clipboard: { read } });
}

describe('reading images from the clipboard for the paste button', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('hands back the image as a file named for when it was pasted, byte for byte', async () => {
		withClipboard(async () => [entryOf('text/html', 'image/png')]);
		const { status, files } = await readClipboardImages(pastedAt);
		const [picture] = files;
		expect(status).toBe(clipboardReadings.read);
		expect(files).toHaveLength(1);
		expect(picture.name).toBe('pasted-image-2026-10-08-154607.png');
		expect(picture.type).toBe('image/png');
		expect([...new Uint8Array(await picture.arrayBuffer())]).toEqual(pictureBytes);
	});

	it('takes every image there, and gives each the ending its type carries', async () => {
		withClipboard(async () => [entryOf('image/jpeg'), entryOf('image/svg+xml'), entryOf('text/plain')]);
		const { files } = await readClipboardImages(pastedAt);
		const names = files.map((file) => file.name);
		expect(names).toEqual(['pasted-image-2026-10-08-154607.jpeg', 'pasted-image-2026-10-08-154607.svg']);
	});

	it('finds nothing when the clipboard holds only words', async () => {
		withClipboard(async () => [entryOf('text/plain', 'text/html')]);
		expect(await readClipboardImages(pastedAt)).toEqual({ status: clipboardReadings.read, files: [] });
	});

	it('says it was refused when the browser will not let the page read the clipboard', async () => {
		const blockedByPolicy = new DOMException('blocked by a permissions policy', 'NotAllowedError');
		withClipboard(async () => Promise.reject(blockedByPolicy));
		expect(await readClipboardImages(pastedAt)).toMatchObject({ status: clipboardReadings.refused });
	});

	it('says it was refused where the browser has no way to read the clipboard at all', async () => {
		vi.stubGlobal('navigator', {});
		expect(await readClipboardImages(pastedAt)).toMatchObject({ status: clipboardReadings.refused });
	});

	it('names the paste keys as the keyboard in front of the person shows them', () => {
		vi.stubGlobal('navigator', { userAgent: macintosh });
		expect(pasteKeysHere()).toBe('⌘V');
		vi.stubGlobal('navigator', { userAgent: windows });
		expect(pasteKeysHere()).toBe('Ctrl+V');
	});
});
