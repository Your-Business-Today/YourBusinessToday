const enumerationMarker = /\((\d{1,2})\)\s+/g;
const sentenceEnd = /[.!?](?=\s+[A-Z])/;
const firstNumber = 1;
const fewestItems = 2;

type Marker = { number: number; start: number; end: number };

/**
 * A paragraph that counts its points inline — "All six are true: (1) … (2) …" —
 * written out as a numbered list. The last point ends at its sentence; whatever
 * follows it stays a paragraph of its own.
 */
export function listInlineEnumeration(paragraph: string): string {
	const markers = numberedRun(paragraph);
	if (markers.length < fewestItems) return paragraph;
	const lead = paragraph.slice(0, markers[0].start).trim();
	const items = markers.map((marker, index) => itemText(paragraph, markers, index));
	const lastItem = splitAtSentenceEnd(items[items.length - 1]);
	items[items.length - 1] = lastItem.sentence;
	const list = items.map((item, index) => `${index + firstNumber}. ${item}`).join('\n');
	return [lead, list, lastItem.remainder].filter((part) => part !== '').join('\n\n');
}

function numberedRun(paragraph: string): Marker[] {
	const run: Marker[] = [];
	for (const match of paragraph.matchAll(enumerationMarker)) {
		const number = Number(match[1]);
		if (number !== run.length + firstNumber) continue;
		const start = match.index ?? 0;
		run.push({ number, start, end: start + match[0].length });
	}
	return run;
}

function itemText(paragraph: string, markers: Marker[], index: number): string {
	const nextMarker = markers[index + 1];
	const end = nextMarker === undefined ? paragraph.length : nextMarker.start;
	return paragraph.slice(markers[index].end, end).trim();
}

function splitAtSentenceEnd(text: string): { sentence: string; remainder: string } {
	const boundary = sentenceEnd.exec(text);
	if (boundary === null) return { sentence: text, remainder: '' };
	const cut = boundary.index + boundary[0].length;
	return { sentence: text.slice(0, cut).trim(), remainder: text.slice(cut).trim() };
}
