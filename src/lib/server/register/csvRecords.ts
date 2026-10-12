const comma = ',';
const quote = '"';
const lineFeed = '\n';
const carriageReturn = '\r';

/** Reads comma-separated records from text that arrives in chunks, quotes and all, one character at a time. */
export class CsvRecordReader {
	private field = '';
	private record: string[] = [];
	private isInQuotes = false;
	private wasQuoteSeen = false;

	push(text: string): string[][] {
		const records: string[][] = [];
		for (const character of text) {
			const record = this.readCharacter(character);
			if (record !== null) records.push(record);
		}
		return records;
	}

	finish(): string[][] {
		if (this.field === '' && this.record.length === 0) return [];
		return [this.endRecord()];
	}

	private readCharacter(character: string): string[] | null {
		if (this.isInQuotes) return this.readQuoted(character);
		if (character === quote && this.field === '') {
			this.isInQuotes = true;
			return null;
		}
		return this.readPlain(character);
	}

	private readQuoted(character: string): string[] | null {
		if (character === quote && !this.wasQuoteSeen) {
			this.wasQuoteSeen = true;
			return null;
		}
		if (character === quote) {
			this.field += quote;
			this.wasQuoteSeen = false;
			return null;
		}
		if (!this.wasQuoteSeen) {
			this.field += character;
			return null;
		}
		this.isInQuotes = false;
		this.wasQuoteSeen = false;
		return this.readPlain(character);
	}

	private readPlain(character: string): string[] | null {
		if (character === comma) {
			this.record.push(this.field);
			this.field = '';
			return null;
		}
		if (character === lineFeed) return this.endRecord();
		if (character !== carriageReturn) this.field += character;
		return null;
	}

	private endRecord(): string[] {
		this.record.push(this.field);
		const record = this.record;
		this.field = '';
		this.record = [];
		return record;
	}
}
