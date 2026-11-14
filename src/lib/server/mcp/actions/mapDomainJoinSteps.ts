import { isVocabularyFiled, type MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { linesNotWords, phrasesNotWords } from '$lib/data/workflowMap/mapDomainJoin';
import { namedThings, quotedPhrases, thingsOnNoTask } from './mapDomainJoinSections';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const writeInGlossaryWords =
	"Write what each task takes in and produces in the glossary's words: the record's name, or the word that names it in a status " +
	'(a "sent invoice"), so the map joins the domain without anyone naming slugs. A phrase the glossary does not hold is a question ' +
	'for the person: what is it, and what is it called?';

/** The domain run's step 1 on the map: the phrases and lines it uses that are not words yet, each a word to file. */
export function domainRunNotJoined(map: WorkflowMapVersion, vocabulary: MapVocabulary): string[] {
	if (!isVocabularyFiled(vocabulary)) return [];
	const phrases = phrasesNotWords(map, vocabulary);
	const lines = linesNotWords(map, vocabulary);
	if (phrases.length + lines.length === 0) return ['   - Every phrase and line on the map is already a word of the glossary.'];
	const phraseLine =
		phrases.length === 0
			? []
			: [`   - Phrases on the map that are not words yet (${phrases.length}): ${quotedPhrases(phrases)}. File each as a word naming the record, and its status where it names one.`];
	const lineLine =
		lines.length === 0 ? [] : [`   - Lines on the map that are not words yet (${lines.length}): ${quotedPhrases(lines)}. File each as a word that is a role.`];
	return [...phraseLine, ...lineLine];
}

/** The workflow map run's step 1 on the domain: write in its words, and the things no task takes in or produces yet. */
export function workflowMapRunDomainSection(map: WorkflowMapVersion | null, vocabulary: MapVocabulary): string[] {
	if (!isVocabularyFiled(vocabulary)) return [];
	const unplaced = thingsOnNoTask(map, vocabulary);
	const placing =
		unplaced.length === 0
			? 'Every thing in the domain is taken in or produced by a task.'
			: `Things in the domain that no task takes in or produces yet (${unplaced.length}): ${namedThings(unplaced)}. Ask which task makes or uses each.`;
	return [`**The domain.** ${writeInGlossaryWords} ${placing}`];
}
