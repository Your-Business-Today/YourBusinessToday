import { afterEach, describe, expect, it, vi } from 'vitest';
import { clipboardReadings } from '$lib/uploadBox/boxClipboard.js';
import { pasteNoteFor } from './pasteNotes';

const picture = new File([new Uint8Array([1, 2, 3])], 'pasted-image.png', { type: 'image/png' });
const refused = { status: clipboardReadings.refused, files: [] };
const nothingThere = { status: clipboardReadings.read, files: [] };

function onADevice(hasKeyboard: boolean) {
	vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
	vi.stubGlobal('window', { matchMedia: () => ({ matches: hasKeyboard }) });
}

describe('what the upload page says when the paste button brings no file', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('says nothing when an image came', () => {
		onADevice(true);
		expect(pasteNoteFor({ status: clipboardReadings.read, files: [picture] })).toBeNull();
	});

	it('sends a refused reading to the paste keys, which need no permission', () => {
		onADevice(true);
		expect(pasteNoteFor(refused)).toBe(
			'Your browser would not let this page read the clipboard. Press Ctrl+V instead.'
		);
	});

	it('sends a refused reading to the file chooser on a phone, which has no paste keys', () => {
		onADevice(false);
		expect(pasteNoteFor(refused)).toContain('Choose the image instead.');
	});

	it('says the clipboard holds no image, and how a copied file can still be pasted', () => {
		onADevice(true);
		expect(pasteNoteFor(nothingThere)).toBe(
			'There is no image on the clipboard. For a copied file, press Ctrl+V.'
		);
		onADevice(false);
		expect(pasteNoteFor(nothingThere)).toBe('There is no image on the clipboard.');
	});
});
