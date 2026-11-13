import { describe, expect, it } from 'vitest';
import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { glossaryJoinMap, glossaryJoinVocabulary } from '$lib/data/workflowMap/tests/glossaryJoinMap';
import { domainRunNotJoined, workflowMapRunDomainSection } from './mapDomainJoinSteps';
import { phrasesNotWordsSection, thingsOnNoTaskSection } from './mapDomainJoinSections';

describe('read_workflow_map closes with what the glossary does not hold', () => {
	it('names the phrases and the lines that are not words', () => {
		const section = phrasesNotWordsSection(glossaryJoinMap, glossaryJoinVocabulary);
		expect(section).toContain('- Phrases (1): "Payment reminder"');
		expect(section).toContain('- Lines (1): "Office"');
	});

	it('says nothing is checked while no domain is filed', () => {
		expect(phrasesNotWordsSection(glossaryJoinMap, emptyVocabulary)).toContain('No domain is filed yet');
	});
});

describe('read_business_brain_domain closes with the things on no task', () => {
	it('names each thing no station takes in or produces', () => {
		expect(thingsOnNoTaskSection(glossaryJoinMap, glossaryJoinVocabulary)).toContain('1 no task of today\'s workflow map takes in or produces: Variation (`variation`).');
	});

	it('says so when no map is filed', () => {
		expect(thingsOnNoTaskSection(null, glossaryJoinVocabulary)).toContain('No workflow map is filed yet');
	});
});

describe('both runs open with what does not join', () => {
	it('lists the phrases and lines the domain run should file as words', () => {
		const lines = domainRunNotJoined(glossaryJoinMap, glossaryJoinVocabulary).join('\n');
		expect(lines).toContain('Phrases on the map that are not words yet (1): "Payment reminder"');
		expect(lines).toContain('Lines on the map that are not words yet (1): "Office". File each as a word that is a role.');
	});

	it('lists the things the workflow map run should place, and asks for the glossary’s words', () => {
		const [section] = workflowMapRunDomainSection(glossaryJoinMap, glossaryJoinVocabulary);
		expect(section).toContain("in the glossary's words");
		expect(section).toContain('no task takes in or produces yet (1): Variation (`variation`)');
	});

	it('adds nothing to either run before a domain is filed', () => {
		expect(domainRunNotJoined(glossaryJoinMap, emptyVocabulary)).toEqual([]);
		expect(workflowMapRunDomainSection(glossaryJoinMap, emptyVocabulary)).toEqual([]);
	});
});
