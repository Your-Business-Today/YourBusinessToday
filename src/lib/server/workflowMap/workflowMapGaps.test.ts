import { describe, expect, it } from 'vitest';
import { mapStage, stationState, type MapStation, type WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import { workflowMapGaps } from './workflowMapGaps';

function station(key: string, name: string, overrides: Partial<MapStation> = {}): MapStation {
	return {
		key, name, summary: `${name}.`, takesIn: ['Enquiry'], produces: ['Quote'], doneIn: 'Spreadsheet', isOutput: false,
		state: stationState.elsewhere, productId: null, takesInThings: [], producesThings: [], ...overrides
	};
}

function joineryMap(): WorkflowMapDraft {
	const estimator = { key: 'estimator', name: 'Estimator', stations: [station('price-job', 'Price job'), station('send-quote', 'Send quote')] };
	const workshop = { key: 'workshop', name: 'Workshop', stations: [station('make-joinery', 'Make joinery', { isOutput: true })] };
	const handovers = [{ fromKey: 'send-quote', toKey: 'make-joinery', handedOver: 'Accepted quote', goesWrong: null }];
	return { stage: mapStage.before, lines: [estimator, workshop], handovers };
}

describe('what a filed workflow map still leaves open', () => {
	it('asks nothing of a map whose tasks all take in, produce, are done somewhere and hand on', () => {
		const map = joineryMap();
		map.lines[1].stations.push(station('fit-joinery', 'Fit joinery', { isOutput: true }));
		expect(workflowMapGaps(map)).toEqual([]);
	});

	it('asks about a role with one task, a task with no input, no output or no place, and an output going nowhere', () => {
		const map = joineryMap();
		map.lines[0].stations[0] = station('price-job', 'Price job', { takesIn: [], produces: [], doneIn: null });
		map.handovers = [];
		expect(workflowMapGaps(map)).toEqual([
			'The Workshop role has one task: what else does it do?',
			'Price job (Estimator) takes nothing in: what must exist before it can start?',
			'Price job (Estimator) produces nothing: what does it hand on?',
			'Price job (Estimator) is done nowhere named: is it a product, a spreadsheet, email or paper?',
			'What Send quote (Estimator) produces goes nowhere: who receives it, or is it an output the business runs on?'
		]);
	});

	it('asks for the outputs the business runs on when none is marked', () => {
		const map = joineryMap();
		map.lines[1].stations[0].isOutput = false;
		expect(workflowMapGaps(map)).toContain('No task is marked as producing an output the business runs on: which ones do?');
	});
});
