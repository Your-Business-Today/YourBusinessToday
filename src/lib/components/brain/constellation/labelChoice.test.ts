import { describe, expect, it } from 'vitest';
import { buildConstellationModel } from './buildConstellationModel';
import { labelsWorthShowing, wholeBrainAttention } from './labelChoice';

const area = (slug: string) => ({ slug, name: slug, summary: '', isCoreDomain: false });
const page = (slug: string, contextSlug: string) => ({ slug, title: slug, summary: '', kind: 'entity', contextSlug });
const model = buildConstellationModel(
	[area('yard'), area('money')],
	[page('berth', 'yard'), page('hoist', 'yard'), page('crane', 'yard'), page('invoice', 'money')],
	[
		{ fromSlug: 'hoist', toSlug: 'berth' },
		{ fromSlug: 'hoist', toSlug: 'invoice' }
	]
);

describe('the labels the drawn brain writes', () => {
	it('names only the areas over the whole brain, the largest first', () => {
		expect(labelsWorthShowing(model, wholeBrainAttention)).toEqual([
			{ slug: 'yard', role: 'area' },
			{ slug: 'money', role: 'area' }
		]);
	});

	it('names an opened area and its pages, the best connected first', () => {
		const labels = labelsWorthShowing(model, { contextSlug: 'yard', neuronSlug: null });
		expect(labels.map(({ slug }) => slug)).toEqual(['yard', 'hoist', 'berth', 'crane']);
	});

	it('names an opened page and only the pages it is linked to, whichever area they sit in', () => {
		const labels = labelsWorthShowing(model, { contextSlug: 'yard', neuronSlug: 'hoist' });
		expect(labels).toEqual([
			{ slug: 'hoist', role: 'opened' },
			{ slug: 'berth', role: 'page' },
			{ slug: 'invoice', role: 'page' }
		]);
	});
});
