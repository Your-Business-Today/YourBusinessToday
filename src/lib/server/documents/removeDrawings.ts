import type JSZip from 'jszip';

const drawingPart = /^xl\/drawings\/(_rels\/)?drawing[^/]*\.xml(\.rels)?$/;
const worksheetPart = /^xl\/worksheets\/[^/]+\.xml$/;
const drawingReference = /<(\w+:)?drawing\s[^>]*\/>/g;

/**
 * Takes the workbook's pictures, shapes and charts out. exceljs throws on a drawing
 * written with any prefix but `xdr:`, and only the cells are read here.
 */
export async function removeDrawings(archive: JSZip): Promise<void> {
	archive.file(drawingPart).forEach((drawing) => archive.remove(drawing.name));
	const worksheets = archive.file(worksheetPart);
	await Promise.all(worksheets.map((worksheet) => dropDrawingReference(archive, worksheet)));
}

async function dropDrawingReference(archive: JSZip, worksheet: JSZip.JSZipObject): Promise<void> {
	const worksheetXml = await worksheet.async('string');
	archive.file(worksheet.name, worksheetXml.replace(drawingReference, ''));
}
