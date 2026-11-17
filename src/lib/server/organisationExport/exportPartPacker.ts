import { zipSync, type Zippable } from 'fflate';

/** One file of an export: where it sits in the zip, its bytes, and whether squeezing it is worth the time. */
export type ExportEntry = { path: string; bytes: Uint8Array; isCompressible: boolean };

const storedAsItIs = 0;
const compressed = 6;

/**
 * Packs an export's files into zips of about a part's size each, so no part is too large to store or to fetch.
 * A file larger than a part goes into a part of its own.
 */
export class ExportPartPacker {
	private entries: Zippable = {};
	private entryCount = 0;
	private byteCount = 0;

	constructor(private readonly partByteLimit: number) {}

	/** Takes the file, and hands back the part it filled, or null while the part has room. */
	add(entry: ExportEntry): Uint8Array | null {
		const { path, bytes, isCompressible } = entry;
		const wouldOverflow = this.entryCount > 0 && this.byteCount + bytes.length > this.partByteLimit;
		const filledPart = wouldOverflow ? this.seal() : null;
		const level = isCompressible ? compressed : storedAsItIs;
		this.entries[path] = [bytes, { level }];
		this.entryCount += 1;
		this.byteCount += bytes.length;
		return filledPart;
	}

	/** The last part, or null when every file has already gone into a part. */
	finish(): Uint8Array | null {
		if (this.entryCount === 0) return null;
		return this.seal();
	}

	private seal(): Uint8Array {
		const part = zipSync(this.entries);
		this.entries = {};
		this.entryCount = 0;
		this.byteCount = 0;
		return part;
	}
}
