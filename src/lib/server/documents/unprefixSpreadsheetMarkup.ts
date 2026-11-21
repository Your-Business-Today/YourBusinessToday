import type JSZip from 'jszip';

const spreadsheetPart = /^xl\/.+\.xml$/;
const spreadsheetNamespaces = [
	'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
	'http://purl.oclc.org/ooxml/spreadsheetml/main'
];
const defaultNamespaceDeclaration = /\sxmlns="/;

/**
 * Writes the spreadsheet markup with no prefix, as Excel does. A workbook written with
 * one, `<x:workbook>` as the Open XML SDK writes it, is valid, but exceljs finds no
 * workbook in it and throws `Cannot read properties of undefined (reading 'sheets')`.
 */
export async function unprefixSpreadsheetMarkup(archive: JSZip): Promise<void> {
	const parts = archive.file(spreadsheetPart);
	await Promise.all(parts.map((part) => unprefixPart(archive, part)));
}

async function unprefixPart(archive: JSZip, part: JSZip.JSZipObject): Promise<void> {
	const partXml = await part.async('string');
	const prefix = spreadsheetPrefixIn(partXml);
	if (prefix === undefined) return;
	archive.file(part.name, withoutPrefix(partXml, prefix));
}

function spreadsheetPrefixIn(partXml: string): string | undefined {
	const declarations = partXml.matchAll(/\sxmlns:(\w+)="([^"]+)"/g);
	const spreadsheetDeclaration = [...declarations].find(([, , namespace]) =>
		spreadsheetNamespaces.includes(namespace)
	);
	return spreadsheetDeclaration?.[1];
}

function withoutPrefix(partXml: string, prefix: string): string {
	const hasDefaultNamespace = defaultNamespaceDeclaration.test(partXml);
	const declaration = new RegExp(`\\sxmlns:${prefix}="([^"]+)"`);
	const unprefixed = partXml.replace(new RegExp(`<(/?)${prefix}:`, 'g'), '<$1');
	if (hasDefaultNamespace) return unprefixed.replace(declaration, '');
	return unprefixed.replace(declaration, ' xmlns="$1"');
}
