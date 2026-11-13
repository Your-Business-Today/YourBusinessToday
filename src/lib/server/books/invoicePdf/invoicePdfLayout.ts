import { rgb } from 'pdf-lib';

/** An A4 page in PDF points, and the margin kept clear all round it. */
export const a4Page = { width: 595.28, height: 841.89, margin: 48 };

export const writingWidth = a4Page.width - 2 * a4Page.margin;

/** How far apart the lines of one paragraph sit, as a share of the text's size. */
export const lineSpacing = 1.4;

/** The space left between one part of the invoice and the next. */
export const sectionSpace = 20;

export const textSizes = { title: 18, partyName: 12, heading: 8, body: 9.5, mark: 96 };

export const inks = {
	strong: rgb(0.11, 0.11, 0.13),
	muted: rgb(0.33, 0.33, 0.38),
	faint: rgb(0.55, 0.55, 0.6),
	signal: rgb(0.8, 0.27, 0.15),
	rule: rgb(0.82, 0.82, 0.85)
};

/** The space below each line of the lines table, so its rows read apart. */
export const tableRowSpace = 9;

/** The stamp across a draft, a paid or a void invoice: turned a little, and pale enough to read through. */
export const stampMark = { turnedDegrees: 12, opacity: 0.12 };

/** The lines table across the page: the description takes what the three figures leave. */
export const lineColumnWidths = { quantity: 60, unitPrice: 90, amount: 90 };
