import { penStyles, rowOf } from '$lib/server/books/invoicePdf/invoicePdfRows';
import type { PenStyle, TextRow } from '$lib/server/books/invoicePdf/pdfPen';

const headingMarks = /^(#{1,6})\s+/;
const listMark = /^\s*[-*+]\s+/;
const tableRule = /^\s*\|?\s*:?-{3,}/;
const links = /\[([^\]]+)\]\([^)]*\)/g;
const emphasis = /(\*\*|__|\*|`)/g;
const lineBreaks = /\r?\n/;
const bullet = '• ';
const tableEdges = /^\s*\||\|\s*$/g;
const tableCells = /\s*\|\s*/g;
const tableGap = '   ';
const topHeadingLevel = 2;

/** The document's Markdown as the rows a PDF prints: headings in bold, lists with bullets, tables as spaced lines. */
export function markdownRows(markdown: string): TextRow[] {
	const rows = markdown.split(lineBreaks).filter((line) => !tableRule.test(line)).map(rowOfLine);
	return rows.filter((row, index) => !isRepeatedBlank(rows, index));
}

function rowOfLine(line: string): TextRow {
	const heading = headingMarks.exec(line);
	if (heading !== null) return rowOf(plainTextOf(line.replace(headingMarks, '')), headingStyleOf(heading[1].length));
	if (listMark.test(line)) return rowOf(`${bullet}${plainTextOf(line.replace(listMark, ''))}`, penStyles.body);
	return rowOf(plainTextOf(line.replace(tableEdges, '').replace(tableCells, tableGap)), penStyles.body);
}

function headingStyleOf(level: number): PenStyle {
	if (level <= topHeadingLevel) return penStyles.partyName;
	return penStyles.strong;
}

function plainTextOf(text: string): string {
	return text.replace(links, '$1').replace(emphasis, '').trim();
}

function isRepeatedBlank(rows: TextRow[], index: number): boolean {
	const isBlank = rows[index].text === '';
	const isFirst = index === 0;
	if (!isBlank) return false;
	if (isFirst) return true;
	return rows[index - 1].text === '';
}
