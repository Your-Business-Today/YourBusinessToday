import { blanksIn } from '$lib/data/contractBlanks';
import { findClientDocumentEntry } from '$lib/data/clientDocumentCatalogue';
import { assembleContractDocument } from '$lib/server/clientDocuments/assembleContractDocument';
import { fillContractBlanks, type BlankValues } from './fillContractBlanks';

/** One document of a pack as it is drafted: the template it came from, its title and summary, and its filled text. */
export type DraftedContractDocument = { templateSlug: string; title: string; summary: string; markdown: string };

/** Each chosen template with the chosen clauses in their places and its blanks filled, in the order chosen. */
export function draftContractDocuments(documentSlugs: string[], clauseSlugs: string[], values: BlankValues): DraftedContractDocument[] {
	return documentSlugs.map((slug) => draftOne(slug, clauseSlugs, values));
}

function draftOne(templateSlug: string, clauseSlugs: string[], values: BlankValues): DraftedContractDocument {
	const entry = findClientDocumentEntry(templateSlug);
	const assembled = assembleContractDocument(templateSlug, clauseSlugs) ?? '';
	const { title = templateSlug, summary = '' } = entry ?? {};
	return { templateSlug, title, summary, markdown: fillContractBlanks(assembled, values) };
}

/** Why a written value cannot go in, naming the blank no chosen document holds; null when every one has a place. */
export function blanksWithNoPlace(documentSlugs: string[], clauseSlugs: string[], writtenLabels: string[]): string | null {
	const templates = documentSlugs.map((slug) => assembleContractDocument(slug, clauseSlugs) ?? '');
	const everyBlank = new Set(templates.flatMap(blanksIn));
	const homeless = writtenLabels.filter((label) => !everyBlank.has(label));
	if (homeless.length === 0) return null;
	return `No document in this pack has the blank ${homeless.map((label) => `[${label}]`).join(', ')}. read_client_document lists each document's blanks.`;
}
