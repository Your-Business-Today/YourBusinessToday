import type { Tokens } from 'marked';
import { inlineRunsXml } from './wordInlineRuns';

const tableWidthTwips = 9000;

export function tableXml(table: Tokens.Table): string {
	const { header, rows } = table;
	const headerRow = rowXml(header, true);
	const bodyRows = rows.map((row) => rowXml(row, false)).join('');
	return `<w:tbl>${tablePropertiesXml()}${gridXml(header.length)}${headerRow}${bodyRows}</w:tbl><w:p/>`;
}

function tablePropertiesXml(): string {
	return '<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/></w:tblPr>';
}

function gridXml(columnCount: number): string {
	const columnWidth = Math.floor(tableWidthTwips / columnCount);
	const columns = Array.from({ length: columnCount }, () => `<w:gridCol w:w="${columnWidth}"/>`);
	return `<w:tblGrid>${columns.join('')}</w:tblGrid>`;
}

function rowXml(cells: Tokens.TableCell[], isHeader: boolean): string {
	const headerMark = isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
	return `<w:tr>${headerMark}${cells.map((cell) => cellXml(cell, isHeader)).join('')}</w:tr>`;
}

function cellXml(cell: Tokens.TableCell, isHeader: boolean): string {
	const runs = inlineRunsXml(cell.tokens, {
		isBold: isHeader,
		isItalic: false
	});
	return `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p>${runs}</w:p></w:tc>`;
}
