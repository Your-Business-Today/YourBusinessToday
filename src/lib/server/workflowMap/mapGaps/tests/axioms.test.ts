import { describe, expect, it } from 'vitest';
import { lineKind } from '$lib/data/workflowMap/workflowMap';
import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { workflowMapGaps } from '../../workflowMapGaps';
import { completeJoineryMap, joineryStation, stationOf } from './joineryMap';
import { theNamed } from '../stationsOnLines';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

function questionsOf(map: WorkflowMapDraft): string[] {
	return workflowMapGaps(map, emptyVocabulary).map((question) => question.question);
}

describe('a map tested against the axioms of a complete map', () => {
	it('asks nothing of a map that passes every test', () => {
		expect(workflowMapGaps(completeJoineryMap(), emptyVocabulary)).toEqual([]);
	});

	it('axiom 1: asks where an input with no source comes from, and nothing else', () => {
		const map = completeJoineryMap();
		stationOf(map, 'send-quote').takesIn.push('Rate card');
		expect(workflowMapGaps(map, emptyVocabulary)).toEqual([
			{ kind: 'source', question: 'Send quote needs the rate card. Where does it come from?', stationKey: 'send-quote', stationName: 'Send quote', lineKey: 'estimator', lineName: 'Estimator' }
		]);
	});

	it('axiom 1: asks what starts a task that takes nothing in and that nothing arrives at', () => {
		const map = completeJoineryMap();
		map.lines[0].stations.push(joineryStation('chase-quote', 'Chase quote', { takesIn: [], produces: ['Quote'] }));
		expect(questionsOf(map)).toEqual(['Chase quote takes nothing in and nothing arrives at it: what must exist before it can start?']);
	});

	it('axiom 2: asks who picks up an output with no destination, on any station of its line, and nothing else', () => {
		const map = completeJoineryMap();
		stationOf(map, 'price-job').produces.push('Price breakdown');
		expect(questionsOf(map)).toEqual(['Price job produces the price breakdown. Who picks it up, or is it an output the business runs on?']);
	});

	it('axiom 3: asks what goes wrong at a hand-over with no answer, and never at one with any answer', () => {
		const map = completeJoineryMap();
		map.handovers[0].goesWrong = null;
		map.handovers[1].goesWrong = 'Nothing goes wrong here.';
		expect(questionsOf(map)).toEqual(['When the Estimator hands the sent quote to the Customer, what goes wrong or is delayed?']);
	});

	it('axiom 4: asks how an output that cannot be traced to anything arriving from outside starts, and nothing else', () => {
		const map = completeJoineryMap();
		const orderParts = joineryStation('order-parts', 'Order parts', { takesIn: ['Stock count'], produces: ['Spare parts'] });
		const countStock = joineryStation('count-stock', 'Count stock', { takesIn: ['Spare parts'], produces: ['Stock count'] }, { isOutput: true });
		map.lines.push({ key: 'stores', name: 'Stores', kind: lineKind.role, stations: [orderParts, countStock] });
		expect(questionsOf(map)).toEqual(['I cannot trace the stock count back to where the work starts. What am I missing?']);
	});

	it('axiom 4: traces nothing when nothing arrives from outside', () => {
		const map = completeJoineryMap();
		map.arrivals = [];
		const questions = workflowMapGaps(map, emptyVocabulary);
		expect(questions.filter((question) => question.kind === 'trace').map((question) => question.stationKey)).toEqual(['make-joinery', 'fit-joinery']);
	});
});

describe('how a question names a phrase', () => {
	it('lowers an ordinary first word and keeps a name or an initialism as written', () => {
		expect(theNamed('Rate card')).toBe('the rate card');
		expect(theNamed('BoQ rates')).toBe('the BoQ rates');
		expect(theNamed('H&S framework')).toBe('the H&S framework');
		expect(theNamed('VAT analysis')).toBe('the VAT analysis');
	});
});
