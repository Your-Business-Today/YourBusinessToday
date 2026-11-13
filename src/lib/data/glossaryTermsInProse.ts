import type { DomainTermFact } from './businessBrainDomain';

const boldTermLine = /^\s*(?:[-*]\s+)?\*\*(.+?)\*\*\s*(?::|—|–|-)?\s*(.+)$/;
const listedTermLine = /^\s*[-*]\s+([^:—–]+?)\s*(?::|—|–|\s-\s)\s*(.+)$/;
const termPatterns = [boldTermLine, listedTermLine];
const trailingColon = /:$/;

/**
 * The words a glossary filed before words were kept one to a row holds in its prose: each line that is a
 * bold term or a listed term followed by its meaning. A line in any other shape is not taken for a word.
 */
export function glossaryTermsInProse(body: string): DomainTermFact[] {
	return body.split('\n').flatMap((line) => {
		const term = termOfLine(line);
		return term === null ? [] : [term];
	});
}

function termOfMatch([, word, meaning]: RegExpExecArray): DomainTermFact {
	return { word: word.trim().replace(trailingColon, ''), meaning: meaning.trim() };
}

function termOfLine(line: string): DomainTermFact | null {
	for (const pattern of termPatterns) {
		const match = pattern.exec(line);
		if (match !== null) return termOfMatch(match);
	}
	return null;
}
