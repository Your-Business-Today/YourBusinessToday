import { isVocabularyFiled, type MapVocabulary, type VocabularyThing } from '$lib/data/workflowMap/phraseInDomain';
import { linesNotWords, phrasesNotWords, thingsOnNoStation } from '$lib/data/workflowMap/mapDomainJoin';
import { thingStationsOf } from '$lib/data/workflowMap/thingStations';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const noDomainToCheck = 'No domain is filed yet, so no phrase is checked against the glossary.';
const noMapToCheck = 'No workflow map is filed yet, so no thing is on a task.';

/** The things of the domain that no task of the map takes in or produces. */
export function thingsOnNoTask(map: WorkflowMapVersion | null, vocabulary: MapVocabulary): VocabularyThing[] {
	return thingsOnNoStation(vocabulary.things, thingStationsOf(map, vocabulary));
}

/** The things named as a list: each title with its slug. */
export function namedThings(things: VocabularyThing[]): string {
	return things.map(({ title, slug }) => `${title} (\`${slug}\`)`).join(', ');
}

/** The phrases quoted as a list. */
export function quotedPhrases(phrases: string[]): string {
	return phrases.map((phrase) => `"${phrase}"`).join(', ');
}

/** The close of read_workflow_map: the phrases and lines of a map the glossary does not hold. */
export function phrasesNotWordsSection(map: WorkflowMapVersion, vocabulary: MapVocabulary): string {
	const heading = '### Not in the glossary';
	if (!isVocabularyFiled(vocabulary)) return `${heading}\n\n${noDomainToCheck}`;
	const phrases = phrasesNotWords(map, vocabulary);
	const lines = linesNotWords(map, vocabulary);
	if (phrases.length + lines.length === 0) return `${heading}\n\nEvery phrase and line on the map is a word of the glossary or a thing of the domain.`;
	const phraseLine = phrases.length === 0 ? [] : [`- Phrases (${phrases.length}): ${quotedPhrases(phrases)}`];
	const lineLine = lines.length === 0 ? [] : [`- Lines (${lines.length}): ${quotedPhrases(lines)}`];
	return [heading, ...phraseLine, ...lineLine].join('\n');
}

/** The close of read_business_brain_domain: the things no task of today's map takes in or produces. */
export function thingsOnNoTaskSection(map: WorkflowMapVersion | null, vocabulary: MapVocabulary): string {
	const heading = '## Things on no task';
	if (map === null) return `${heading}\n${noMapToCheck}`;
	const unplaced = thingsOnNoTask(map, vocabulary);
	if (unplaced.length === 0) return `${heading}\nEvery thing is taken in or produced by a task of today's workflow map.`;
	return `${heading}\n${unplaced.length} no task of today's workflow map takes in or produces: ${namedThings(unplaced)}.`;
}
