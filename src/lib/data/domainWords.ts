import { glossaryTermsInProse } from './glossaryTermsInProse';
import type { DomainGlossary, DomainWord } from './domainReading';

/** The glossaries that keep their words only in prose, whose bodies are read to list them. */
export function glossariesInProse(glossaries: DomainGlossary[]): DomainGlossary[] {
	return glossaries.filter(({ terms }) => terms.length === 0);
}

/** Every word of every glossary, one to a row in alphabetical order; a glossary in prose gives the words its lines name. */
export function domainWordsOf(glossaries: DomainGlossary[], proseBodies: Map<string, string>): DomainWord[] {
	const words = glossaries.flatMap(({ pageId, areaTitle, terms }) => {
		const listed = terms.length > 0 ? terms : glossaryTermsInProse(proseBodies.get(pageId) ?? '');
		return listed.map((term) => ({ ...term, areaTitle, glossaryPageId: pageId }));
	});
	const keys = words.map(wordKey);
	const firstOfEach = words.filter((word, index) => keys.indexOf(wordKey(word)) === index);
	return firstOfEach.sort((first, second) => first.word.localeCompare(second.word));
}

/** A word is listed once for each glossary it is in. */
export function wordKey({ glossaryPageId, word }: DomainWord): string {
	return `${glossaryPageId}:${word}`;
}
