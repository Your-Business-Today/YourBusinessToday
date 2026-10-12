import { createReadStream } from 'node:fs';
import { Unzip, UnzipInflate, type UnzipFile } from 'fflate';
import { CsvRecordReader } from './csvRecords';

const csvSuffix = '.csv';

/** The records of the CSV inside the monthly zip, streamed so a file of gigabytes never sits in memory. */
export async function* csvRecordsInZip(zipPath: string): AsyncGenerator<string[]> {
	const reader = new CsvRecordReader();
	const decoder = new TextDecoder();
	let pending: string[][] = [];
	const unzip = new Unzip();
	unzip.register(UnzipInflate);
	unzip.onfile = (file) => readCsvFile(file, reader, decoder, (records) => pending.push(...records));
	for await (const chunk of createReadStream(zipPath)) {
		unzip.push(new Uint8Array(chunk as Buffer), false);
		const records = pending;
		pending = [];
		yield* records;
	}
	unzip.push(new Uint8Array(0), true);
	yield* pending;
}

function readCsvFile(
	file: UnzipFile,
	reader: CsvRecordReader,
	decoder: TextDecoder,
	onRecords: (records: string[][]) => void
): void {
	const isCsv = file.name.toLowerCase().endsWith(csvSuffix);
	if (!isCsv) return;
	file.ondata = (error, chunk, isFinal) => {
		if (error) throw error;
		const text = decoder.decode(chunk, { stream: !isFinal });
		onRecords(reader.push(text));
		if (!isFinal) return;
		onRecords(reader.finish());
	};
	file.start();
}
