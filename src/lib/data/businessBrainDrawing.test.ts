import { describe, expect, it } from 'vitest';
import { drawBusinessBrain, type DrawnPageRow } from './businessBrainDrawing';

const expertise = 'part-expertise';

function pageOf(id: string, kind: string, extra: Partial<DrawnPageRow> = {}): DrawnPageRow {
	return { id, partId: expertise, parentPageId: null, kind, slug: id, title: `Title of ${id}`, summary: '', facts: {}, ...extra };
}

const billing = pageOf('billing', 'bounded_context', { facts: { isCoreDomain: true } });
const invoice = pageOf('invoice', 'entity', { parentPageId: 'billing', facts: { fields: [{ name: 'plan', ref: 'plan' }] } });
const plan = pageOf('plan', 'entity', { parentPageId: 'billing' });
const paidRule = pageOf('paid-rule', 'rule', { facts: { governs: ['invoice'] } });
const lesson = pageOf('lesson', 'lesson', { partId: 'part-experience' });

describe('the drawn Your Business Brain', () => {
	const drawing = drawBusinessBrain([billing, invoice, plan, paidRule, lesson], [{ fromPageId: 'lesson', toPageId: 'plan' }]);

	it('draws each area as a lobe, with whether it is the core domain', () => {
		expect(drawing.contexts).toEqual([{ slug: 'billing', name: 'Title of billing', summary: '', isCoreDomain: true }]);
	});

	it('draws every other page as a neuron in the area it is filed under', () => {
		const areaOf = Object.fromEntries(drawing.pageIndex.map((page) => [page.slug, page.contextSlug]));
		expect(areaOf).toEqual({ invoice: 'billing', plan: 'billing', 'paid-rule': 'billing', lesson: 'billing' });
	});

	it('links the pages filed as linked, and the things a page names by their slugs', () => {
		expect(drawing.pageLinks).toEqual([
			{ fromSlug: 'lesson', toSlug: 'plan' },
			{ fromSlug: 'invoice', toSlug: 'plan' },
			{ fromSlug: 'paid-rule', toSlug: 'invoice' }
		]);
	});

	it('leaves a page that is neither filed under an area nor linked to one outside every lobe', () => {
		const loose = drawBusinessBrain([billing, pageOf('loose', 'rule')], []);
		expect(loose.pageIndex[0].contextSlug).toBeNull();
	});
});
