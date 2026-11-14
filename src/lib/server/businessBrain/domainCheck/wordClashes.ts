import { candidateOf, pagesWithId, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { wordingOf } from '$lib/data/workflowMap/phraseInDomain';
import type { DomainWord } from '$lib/data/domainReading';

/** Words that mean two things: one word in two areas' glossaries with different meanings, and a word that is also another word's other name. */
export function wordClashes(held: DomainCheckHeld): DomainCheckCandidate[] {
	return [...meaningClashes(held), ...otherNameClashes(held)];
}

function meaningClashes(held: DomainCheckHeld): DomainCheckCandidate[] {
	const wordings = [...new Set(held.words.map((word) => wordingOf(word.word)))];
	return wordings.flatMap((wording) => {
		const rows = held.words.filter((word) => wordingOf(word.word) === wording);
		const glossaryCount = new Set(rows.map((row) => row.glossaryPageId)).size;
		const meaningCount = new Set(rows.map((row) => wordingOf(row.meaning))).size;
		const isOneWordTwoWays = glossaryCount > 1 && meaningCount > 1;
		if (!isOneWordTwoWays) return [];
		const [first] = rows;
		const meanings = rows.map((row) => `"${row.meaning}" in ${row.areaTitle}`).join(' and ');
		const finding = `"${first.word}" means ${meanings}: one word, two meanings. Rename one, or say where the meaning changes.`;
		return [candidateOf(domainCheckKind.wordClash, finding, glossariesOf(held, rows))];
	});
}

function otherNameClashes(held: DomainCheckHeld): DomainCheckCandidate[] {
	return held.words.flatMap((word) =>
		word.otherNames.flatMap((otherName) => {
			const isOtherWord = (other: DomainWord) => other !== word && wordingOf(other.word) === wordingOf(otherName);
			const clashing = held.words.filter(isOtherWord);
			if (clashing.length === 0) return [];
			const finding = `"${otherName}" is a word of its own and also another name for "${word.word}" in ${word.areaTitle}. Which does it name?`;
			return [candidateOf(domainCheckKind.wordClash, finding, glossariesOf(held, [word, ...clashing]))];
		})
	);
}

function glossariesOf(held: DomainCheckHeld, words: DomainWord[]): ReturnType<typeof pagesWithId> {
	const glossaryPageIds = [...new Set(words.map((word) => word.glossaryPageId))];
	return glossaryPageIds.flatMap((pageId) => pagesWithId(held, pageId));
}
