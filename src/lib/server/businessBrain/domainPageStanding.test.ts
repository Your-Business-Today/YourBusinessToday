import { describe, expect, it } from 'vitest';
import { canonicalJson, readsAsFiled, valuesOfStanding, type DomainPageStanding } from './domainPageStanding';

const standing: DomainPageStanding = {
	pageId: 'page-1',
	sourceId: null,
	kind: 'entity',
	slug: 'job',
	title: 'Job',
	summary: 'A piece of work',
	body: 'A job is…',
	facts: { statuses: ['won'], fields: [] },
	parentPageId: 'context-1',
	updatedAt: '2026-11-12T08:00:00Z'
};

describe('readsAsFiled', () => {
	it('reads facts the same whatever order their keys are kept in', () => {
		expect(canonicalJson({ statuses: ['won'], fields: [] })).toBe(canonicalJson({ fields: [], statuses: ['won'] }));
		expect(readsAsFiled(standing, { ...valuesOfStanding(standing), facts: { fields: [], statuses: ['won'] } })).toBe(true);
	});

	it('sees a page moved to another context, or given other facts, as changed', () => {
		expect(readsAsFiled(standing, { ...valuesOfStanding(standing), parentPageId: 'context-2' })).toBe(false);
		expect(readsAsFiled(standing, { ...valuesOfStanding(standing), facts: { statuses: ['lost'], fields: [] } })).toBe(false);
	});
});
