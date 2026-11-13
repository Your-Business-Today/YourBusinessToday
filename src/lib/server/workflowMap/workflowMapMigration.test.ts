import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { mapStages, stationStates } from '$lib/data/workflowMap/workflowMap';

const migration = readFileSync('migrations/0210_workflow_maps.sql', 'utf8');

describe('the columns of migration 0210 and the limits the connector checks', () => {
	it('hold the same lengths and counts', () => {
		const checks = [
			`char_length(line_key) between 1 and ${limits.keyLength}`,
			`char_length(station_key) between 1 and ${limits.keyLength}`,
			`position between 1 and ${limits.mostLines}`,
			`position between 1 and ${limits.mostStationsOnALine}`,
			`position between 1 and ${limits.mostHandovers}`,
			`char_length(name) between 1 and ${limits.nameLength}`,
			`char_length(summary) between 1 and ${limits.summaryLength}`,
			`cardinality(takes_in) <= ${limits.mostWordsInAList} and public.workflow_map_words_fit(takes_in, ${limits.wordLength}, null)`,
			`cardinality(produces) <= ${limits.mostWordsInAList} and public.workflow_map_words_fit(produces, ${limits.wordLength}, null)`,
			`char_length(done_in) between 1 and ${limits.doneInLength}`,
			`public.workflow_map_words_fit(takes_in_things, ${limits.thingSlugLength}, `,
			`public.workflow_map_words_fit(produces_things, ${limits.thingSlugLength}, `,
			`char_length(handed_over) between 1 and ${limits.handedOverLength}`,
			`char_length(goes_wrong) between 1 and ${limits.goesWrongLength}`
		];
		for (const check of checks) expect(migration).toContain(check);
	});

	it('allows every stage and every station state, and only those', () => {
		expect(migration).toContain(`stage in (${mapStages.map((stage) => `'${stage}'`).join(', ')})`);
		expect(migration).toContain(`state in (${stationStates.map((state) => `'${state}'`).join(', ')})`);
	});

	it('only adds: it alters, drops and copies from no existing table', () => {
		expect(migration).not.toMatch(/\balter table public\.(?!workflow_map_)/);
		expect(migration).not.toMatch(/\bdrop\b/);
		expect(migration).not.toMatch(/company_context/);
	});
});
