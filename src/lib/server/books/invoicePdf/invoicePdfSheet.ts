import { degrees, PDFDocument, StandardFonts, type PDFPage } from 'pdf-lib';
import { a4Page, inks, sectionSpace, stampMark, textSizes, writingWidth } from './invoicePdfLayout';
import { PdfPen, type TextRow } from './pdfPen';
import { columnHeightOf, columnLineByLine, writeColumnOn, type TextColumn } from './textColumn';

const ruleThickness = 0.75;

/**
 * The pages of one invoice, written from the top down. A block that will not fit starts a new page, and every page
 * after the first opens with the running heading.
 */
export class InvoicePdfSheet {
	private page: PDFPage;
	private cursor = a4Page.height - a4Page.margin;

	private constructor(
		private readonly pdf: PDFDocument,
		private readonly pen: PdfPen,
		private readonly runningHeading: TextRow
	) {
		this.page = pdf.addPage([a4Page.width, a4Page.height]);
	}

	static async open(title: string, author: string, runningHeading: TextRow): Promise<InvoicePdfSheet> {
		const pdf = await PDFDocument.create();
		pdf.setTitle(title);
		pdf.setAuthor(author);
		const regular = await pdf.embedFont(StandardFonts.Helvetica);
		const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
		return new InvoicePdfSheet(pdf, new PdfPen({ regular, bold }), runningHeading);
	}

	/** Starts a new page when the height will not fit on this one, and says whether it did. */
	makeRoomFor(height: number): boolean {
		const hasRoom = this.cursor - height >= a4Page.margin;
		if (hasRoom) return false;
		this.page = this.pdf.addPage([a4Page.width, a4Page.height]);
		this.cursor = a4Page.height - a4Page.margin;
		this.writeColumns([{ rows: [this.runningHeading], x: a4Page.margin, width: writingWidth }]);
		this.rule();
		return true;
	}

	heightOf(columns: TextColumn[]): number {
		return Math.max(0, ...columns.map((column) => columnHeightOf(this.pen, column)));
	}

	/** Writes the columns side by side from the same line, then moves below the longest of them. */
	writeColumns(columns: TextColumn[]): void {
		const height = this.heightOf(columns);
		this.makeRoomFor(height);
		columns.forEach((column) => writeColumnOn(this.page, this.pen, column, this.cursor));
		this.cursor -= height;
	}

	/** Writes one column a line at a time, so however long it is it runs on to the next page. */
	writeFlowing(column: TextColumn): void {
		columnLineByLine(this.pen, column).forEach((line) => this.writeColumns([line]));
	}

	rule(): void {
		const start = { x: a4Page.margin, y: this.cursor };
		const end = { x: a4Page.margin + writingWidth, y: this.cursor };
		this.page.drawLine({ start, end, thickness: ruleThickness, color: inks.rule });
		this.cursor -= sectionSpace / 2;
	}

	space(points: number = sectionSpace): void {
		this.cursor -= points;
	}

	/** The word written large and pale across the first page, as a stamp is across paper. */
	stamp(mark: string): void {
		const style = { size: textSizes.mark, isBold: true };
		const x = (a4Page.width - this.pen.widthOf(mark, style)) / 2;
		const shape = { x, y: a4Page.height / 2, size: style.size, font: this.pen.fontOf(style), opacity: stampMark.opacity };
		const firstPage = this.pdf.getPage(0);
		firstPage.drawText(mark, { ...shape, color: inks.signal, rotate: degrees(stampMark.turnedDegrees) });
	}

	save(): Promise<Uint8Array> {
		return this.pdf.save();
	}
}
