import { describe, expect, it } from 'vitest';
import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import { entitiesOf, type DomainModel } from '$lib/data/blueprint/domainModel';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function page(pageId: string, kind: DomainPageKind, parentPageId: string | null, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId, parentPageId, kind, slug: pageId, title: `The ${pageId}`, summary: '', facts: readDomainPageFacts(facts) };
}

const joinery = page('joinery', 'bounded_context', null, { isCoreDomain: true });
const job = page('job', 'entity', 'joinery', { statuses: ['quoted', 'done'] });
const measurement = page('measurement', 'value_object', 'joinery');
const pricing = page('price-a-job', 'domain_service', 'joinery');
const jobDone = page('job-done', 'domain_event', 'joinery', { marksThingSlug: 'job', marksStatus: 'done' });
const jobFile = page('job-file', 'aggregate', 'joinery', { aggregateRootSlug: 'job', memberSlugs: ['measurement'] });

function modelOf(pages: DomainPage[]): DomainModel {
	const domain = organisationDomainOf(pages);
	if (domain === null) throw new Error('No domain was drawn.');
	return domain.model;
}

describe('manifestOfDomainPages, through organisationDomainOf', () => {
	const model = modelOf([joinery, jobDone, pricing, measurement, job, jobFile]);

	it('draws a record, a detail, an operation and an event, each as its own kind', () => {
		const kinds = Object.fromEntries(entitiesOf(model).map(({ name, kind }) => [name, kind]));
		expect(kinds).toEqual({ job: 'record', measurement: 'detail', 'price-a-job': 'operation', 'job-done': 'event' });
	});

	it('draws a group round its root and its members, in its area', () => {
		const [area] = model.contexts;
		expect(area.groups).toEqual([{ name: 'job-file', title: 'The job-file', memberNames: ['job', 'measurement'] }]);
	});

	it('ties an event to the record it marks, through the status it marks', () => {
		expect(model.relationships).toContainEqual({ fromEntityName: 'job-done', toEntityName: 'job', kind: 'marks', fieldName: 'done' });
	});
});
