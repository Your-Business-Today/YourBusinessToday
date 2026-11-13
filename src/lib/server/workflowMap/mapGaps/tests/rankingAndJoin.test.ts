import { describe, expect, it } from 'vitest';
import { emptyVocabulary, type MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { plainDomainTerm } from '$lib/data/domainTermFacts';
import { workflowMapGaps } from '../../workflowMapGaps';
import { completeJoineryMap, joineryStation, stationOf } from './joineryMap';

const quoteWords: MapVocabulary = {
	things: [{ slug: 'quote', title: 'Quote' }],
	words: [
		{ ...plainDomainTerm('Signed order', 'A quote the customer has signed.'), namesThingSlug: 'quote', namesStatus: 'Accepted' },
		{ ...plainDomainTerm('Accepted quote', 'A quote the customer has accepted.'), namesThingSlug: 'quote', namesStatus: 'Accepted' },
		{ ...plainDomainTerm('Draft quote', 'A quote not yet sent.'), namesThingSlug: 'quote', namesStatus: 'Draft' }
	]
};

describe('the glossary joins what one task produces to what another takes in', () => {
	it('finds the source of an input named in other words for the same thing in the same status', () => {
		const map = completeJoineryMap();
		stationOf(map, 'make-joinery').takesIn = ['Signed order'];
		map.handovers[1].handedOver = 'Signed order';
		expect(workflowMapGaps(map, quoteWords)).toEqual([]);
		expect(workflowMapGaps(map, emptyVocabulary).map((question) => question.kind)).toEqual(['destination']);
	});

	it('does not take the same thing in another status as the source', () => {
		const map = completeJoineryMap();
		stationOf(map, 'make-joinery').takesIn.push('Draft quote');
		const kinds = workflowMapGaps(map, quoteWords).map((question) => question.kind);
		expect(kinds).toEqual(['source']);
	});
});

describe('the order the questions are asked in', () => {
	it('asks what stops an output being traced first, then the hand-overs, then the rest, keeping each line together', () => {
		const map = completeJoineryMap();
		map.handovers[0].goesWrong = null;
		stationOf(map, 'price-job').doneIn = null;
		stationOf(map, 'send-quote').takesIn.push('Rate card');
		map.lines[2].stations.pop();
		map.lines[1].stations.push(joineryStation('pay-deposit', 'Pay deposit', { takesIn: ['Sent quote'], produces: ['Deposit'] }));
		expect(workflowMapGaps(map, emptyVocabulary).map((question) => [question.kind, question.lineKey])).toEqual([
			['source', 'estimator'],
			['destination', 'customer'],
			['handover', 'estimator'],
			['place', 'estimator'],
			['role', 'workshop']
		]);
	});

	it('asks for the outputs when none is marked, about the whole map, after the rest', () => {
		const map = completeJoineryMap();
		stationOf(map, 'make-joinery').isOutput = false;
		stationOf(map, 'fit-joinery').isOutput = false;
		const last = workflowMapGaps(map, emptyVocabulary).at(-1);
		expect(last).toMatchObject({ kind: 'outputs', stationKey: null, lineKey: null });
	});

	it('never asks an outside party or a system for more tasks or where its task is done', () => {
		const map = completeJoineryMap();
		stationOf(map, 'accept-quote').doneIn = null;
		expect(workflowMapGaps(map, emptyVocabulary)).toEqual([]);
	});
});
