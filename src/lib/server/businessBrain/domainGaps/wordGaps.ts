import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { isWordFor, wordingOf } from '$lib/data/workflowMap/phraseInDomain';
import { linesNotWords, phrasesNotWords } from '$lib/data/workflowMap/mapDomainJoin';
import { ruleKinds } from '$lib/data/domainRuleFacts';
import { askedAbout, pageSubject, phraseSubject, vocabularyOf, type DomainHeld } from './domainHeld';
import type { DomainWord } from '$lib/data/domainReading';

/** Statement 5: every phrase on the map is a word, and every word names a record, a status, a role or a rule's term. */
export function wordGaps(held: DomainHeld): DomainQuestion[] {
	return [...phraseGaps(held), ...lineGaps(held), ...namelessWordGaps(held)];
}

function phraseGaps(held: DomainHeld): DomainQuestion[] {
	if (held.map === null) return [];
	const question = (phrase: string) => `The map says ${phrase}. Is it a record you keep, a record in one of its statuses, or a detail of one?`;
	return phrasesNotWords(held.map, vocabularyOf(held)).map((phrase) => askedAbout(domainQuestionKind.phrase, question(phrase), phraseSubject(phrase), null));
}

function lineGaps(held: DomainHeld): DomainQuestion[] {
	if (held.map === null) return [];
	const question = (name: string) => `The map has a line for ${name}. Is ${name} a role, an outside party or a system, and what does the word mean here?`;
	return linesNotWords(held.map, vocabularyOf(held)).map((name) => askedAbout(domainQuestionKind.phrase, question(name), phraseSubject(name), null));
}

function namelessWordGaps({ domain, words }: DomainHeld): DomainQuestion[] {
	const definedWords = domain.rules.filter((rule) => rule.ruleKind === ruleKinds.term).map((rule) => wordingOf(rule.definesWord ?? ''));
	const isDefinedByTerm = (word: DomainWord) => definedWords.some((wording) => isWordFor(word, wording));
	const isNamingNothing = (word: DomainWord) => word.namesThingSlug === null && !word.isRole && !isDefinedByTerm(word);
	return words.filter(isNamingNothing).map((word) => {
		const glossary = domain.glossaries.find((each) => each.pageId === word.glossaryPageId) ?? null;
		const question = `What does "${word.word}" name: a record, a record in one of its statuses, a role, or a term a rule defines?`;
		return askedAbout(domainQuestionKind.word, question, pageSubject(word.word, word.glossaryPageId), glossary);
	});
}
