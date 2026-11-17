import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { ExportPartPacker, type ExportEntry } from './exportPartPacker';

const entryOf = (path: string, byteCount: number): ExportEntry => ({ path, bytes: new Uint8Array(byteCount).fill(7), isCompressible: false });
const pathsIn = (part: Uint8Array) => Object.keys(unzipSync(part));

describe('ExportPartPacker', () => {
	it('keeps everything in one part while it fits', () => {
		const packer = new ExportPartPacker(100);
		expect(packer.add(entryOf('data/a.csv', 40))).toBeNull();
		expect(packer.add(entryOf('data/b.csv', 60))).toBeNull();
		const part = packer.finish();
		expect(part).not.toBeNull();
		expect(pathsIn(part as Uint8Array)).toEqual(['data/a.csv', 'data/b.csv']);
	});

	it('starts a new part when the next file would overflow, and gives a large file a part of its own', () => {
		const packer = new ExportPartPacker(100);
		packer.add(entryOf('data/a.csv', 60));
		const first = packer.add(entryOf('files/video.mp4', 500));
		const second = packer.add(entryOf('files/photo.jpg', 10));
		const third = packer.finish();
		expect([first, second, third].map((part) => pathsIn(part as Uint8Array))).toEqual([
			['data/a.csv'],
			['files/video.mp4'],
			['files/photo.jpg']
		]);
	});

	it('keeps a file’s bytes exactly, and an empty table as an empty file', () => {
		const packer = new ExportPartPacker(100);
		const csv = { path: 'data/empty.csv', bytes: new Uint8Array(0), isCompressible: true };
		packer.add(csv);
		packer.add(entryOf('files/x.bin', 5));
		const files = unzipSync(packer.finish() as Uint8Array);
		expect(files['data/empty.csv']).toEqual(new Uint8Array(0));
		expect(files['files/x.bin']).toEqual(new Uint8Array(5).fill(7));
	});

	it('has nothing to finish once every file is in a part', () => {
		expect(new ExportPartPacker(100).finish()).toBeNull();
	});
});
