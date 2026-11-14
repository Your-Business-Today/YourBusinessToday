import { candidateOf, pagesWithId, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';

/** The words that make a meaning read as a rule: what must, always or never hold, or holds only so. */
const ruleWords = /\b(never|always|must|only|nothing)\b/i;

/** Meanings in a glossary that read as a rule, which belongs on a rule page of its own. */
export function rulesInMeanings(held: DomainCheckHeld): DomainCheckCandidate[] {
	return held.words.flatMap((word) => {
		const ruleWord = ruleWords.exec(word.meaning);
		if (ruleWord === null) return [];
		const [said] = ruleWord;
		const finding = `The meaning of "${word.word}" in ${word.areaTitle} reads as a rule ("${said}"): is there a rule page to file, leaving the meaning to say what the word names?`;
		return [candidateOf(domainCheckKind.ruleInMeaning, finding, pagesWithId(held, word.glossaryPageId))];
	});
}
