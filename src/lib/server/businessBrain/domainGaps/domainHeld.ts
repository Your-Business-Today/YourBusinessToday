import type { DomainAreaPlace, DomainThing, DomainWord } from '$lib/data/domainReading';
import type { DomainQuestion, DomainQuestionKind, DomainQuestionSubject } from '$lib/data/domainQuestions';
import type { MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** What the domain is tested against: the domain, its words one to a row, and today's workflow map when one is filed. */
export type DomainHeld = { domain: OrganisationDomain; words: DomainWord[]; map: WorkflowMapVersion | null };

/** The things and words the map's phrases are found in. */
export function vocabularyOf({ domain, words }: DomainHeld): MapVocabulary {
	return { things: domain.things, words };
}

/** A question of its kind about a subject, in the area it sits in, or in none. */
export function askedAbout(kind: DomainQuestionKind, question: string, subject: DomainQuestionSubject, area: DomainAreaPlace | null): DomainQuestion {
	return { kind, question, ...subject, areaSlug: area?.areaSlug ?? null, areaTitle: area?.areaTitle ?? null };
}

/** A thing as a question is about it, opening its page on the Things tab. */
export function thingSubject({ title, slug, pageId }: DomainThing): DomainQuestionSubject {
	return { about: title, thingSlug: slug, pageId };
}

/** A page that is not a thing, such as a rule or a glossary, as a question is about it. */
export function pageSubject(about: string, pageId: string): DomainQuestionSubject {
	return { about, thingSlug: null, pageId };
}

/** A phrase of the map that the domain does not hold, as a question is about it. */
export function phraseSubject(phrase: string): DomainQuestionSubject {
	return { about: phrase, thingSlug: null, pageId: null };
}
