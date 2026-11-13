import type { PDFFont, RGB } from 'pdf-lib';
import { drawableTextOf } from './drawableText';
import { inks, lineSpacing } from './invoicePdfLayout';

/** How a piece of text is written: its size, its weight and its ink. */
export type PenStyle = { size: number; isBold?: boolean; ink?: RGB };

/** One piece of text in the style it is written in. */
export type TextRow = { text: string; style: PenStyle };

/** The two weights of the one typeface every invoice is written in. */
export type PenFonts = { regular: PDFFont; bold: PDFFont };

const space = ' ';
const lineBreaks = /\r?\n/;

/** Measures and wraps text in the invoice's typeface, writing only characters the typeface holds. */
export class PdfPen {
	private readonly drawable: ReadonlySet<number>;

	constructor(private readonly fonts: PenFonts) {
		this.drawable = new Set(fonts.regular.getCharacterSet());
	}

	fontOf(style: PenStyle): PDFFont {
		return style.isBold === true ? this.fonts.bold : this.fonts.regular;
	}

	inkOf(style: PenStyle): RGB {
		return style.ink ?? inks.strong;
	}

	lineHeightOf(style: PenStyle): number {
		return style.size * lineSpacing;
	}

	widthOf(text: string, style: PenStyle): number {
		return this.fontOf(style).widthOfTextAtSize(text, style.size);
	}

	/** The text as the lines it takes within the width, each paragraph starting a line of its own. */
	linesOf(row: TextRow, width: number): string[] {
		const paragraphs = row.text.split(lineBreaks).map((paragraph) => drawableTextOf(paragraph, this.drawable));
		return paragraphs.flatMap((paragraph) => this.wrap(paragraph, row.style, width));
	}

	private wrap(paragraph: string, style: PenStyle, width: number): string[] {
		const lines: string[] = [];
		let line = '';
		for (const word of paragraph.split(space)) {
			const longer = line === '' ? word : `${line}${space}${word}`;
			const isTooWide = this.widthOf(longer, style) > width && line !== '';
			if (isTooWide) lines.push(line);
			line = isTooWide ? word : longer;
		}
		return [...lines, line];
	}
}
