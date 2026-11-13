import { plainDomainTerm } from '../../domainTermFacts';
import { mapStage, stationState, type MapStation, type WorkflowMapVersion } from '../workflowMap';
import type { MapVocabulary } from '../phraseInDomain';

type StationPhrases = { takesIn?: string[]; produces?: string[]; producesThings?: string[] };

function station(key: string, { takesIn = [], produces = [], producesThings = [] }: StationPhrases): MapStation {
	const unplaced = { doneIn: null, isOutput: false, state: stationState.elsewhere, productId: null, takesInThings: [] };
	return { key, name: key, summary: '', takesIn, produces, producesThings, ...unplaced };
}

/** A domain of four things and the words for three of them: a sent invoice, a subbie by another name and the QS role. */
export const glossaryJoinVocabulary: MapVocabulary = {
	things: [
		{ slug: 'work-order', title: 'Work order' },
		{ slug: 'invoice', title: 'Invoice' },
		{ slug: 'subcontractor', title: 'Subcontractor' },
		{ slug: 'variation', title: 'Variation' }
	],
	words: [
		{ ...plainDomainTerm('Sent invoice', 'An invoice gone to the client.'), namesThingSlug: 'invoice', namesStatus: 'sent' },
		{ ...plainDomainTerm('Subbie', 'A subcontractor.'), namesThingSlug: 'subcontractor', otherNames: ['Subcontractor firm'] },
		{ ...plainDomainTerm('Quantity surveyor', 'Prices and pays the work.'), isRole: true, otherNames: ['QS'] },
		plainDomainTerm('Retention', 'Money held back until the defects period ends.')
	]
};

/**
 * A map whose phrases are a thing's name in another casing, a word naming a record in a status, another name of a word,
 * a line named by a role word, a slug filed by hand and one phrase, "Payment reminder", that is in neither the things nor the words.
 */
export const glossaryJoinMap: WorkflowMapVersion = {
	stage: mapStage.after,
	versionNumber: 3,
	recordedAt: '2026-11-13T21:00:00Z',
	lines: [
		{
			key: 'qs',
			name: 'QS',
			stations: [
				station('award-work', { takesIn: ['Subcontractor firm'], produces: ['work order'] }),
				station('bill-client', { takesIn: ['Work order'], produces: ['Sent invoice'] })
			]
		},
		{ key: 'office', name: 'Office', stations: [station('chase-payment', { takesIn: ['Payment reminder'], producesThings: ['invoice'] })] }
	],
	handovers: [{ fromKey: 'bill-client', toKey: 'chase-payment', handedOver: 'Sent invoice', goesWrong: null }]
};
