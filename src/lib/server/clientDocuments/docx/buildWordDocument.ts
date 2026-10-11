import { marked } from 'marked';
import { strToU8, zipSync } from 'fflate';
import { blocksXml } from './wordBlocksXml';
import {
	contentTypesXml,
	documentRelationshipsXml,
	documentXml,
	packageRelationshipsXml
} from './wordPackageParts';
import { stylesXml } from './wordStylesXml';

export function buildWordDocument(markdown: string): Uint8Array {
	const bodyXml = blocksXml(marked.lexer(markdown));
	return zipSync({
		'[Content_Types].xml': strToU8(contentTypesXml),
		'_rels/.rels': strToU8(packageRelationshipsXml),
		'word/_rels/document.xml.rels': strToU8(documentRelationshipsXml),
		'word/styles.xml': strToU8(stylesXml),
		'word/document.xml': strToU8(documentXml(bodyXml))
	});
}
