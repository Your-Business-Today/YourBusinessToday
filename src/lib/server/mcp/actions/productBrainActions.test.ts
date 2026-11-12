import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productBrainActions } from './productBrainActions';
import { isGatedByModuleRule, moduleNotOnProduct } from '../organisationModuleGate';
import { noSuchPageInProductBrain, noSuchProductOfOrganisation } from './describeProductBrain';
import { notAnOrganisationManager } from '../organisationAccess';
import type { McpCaller } from '../resolveMcpCaller';
import * as standings from './productBrainFixtures';
import { elsewhere, otherProductId, portal, processPage, productId } from './productBrainFixtures';

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	tied: [] as string[],
	ties: [] as unknown[],
	unties: [] as unknown[],
	own: [] as { pageId: string; partKind: string; kind: string; title: string; summary: string; updatedAt: string }[],
	pageOwner: null as string | null
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => ({ id: organisationId, name: organisationId === 'jewel' ? 'Jewel' : 'Other' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/projects/getProject', () => ({
	getProject: async (_supabase: unknown, projectId: string) => [portal, elsewhere].find((project) => project.id === projectId) ?? null
}));
vi.mock('$lib/server/businessBrain/productBrainParts', () => ({
	readPartsTiedTo: async () => brain.tied,
	tieProductBrainParts: async (_supabase: unknown, _tying: unknown, parts: string[]) => brain.ties.push(...parts),
	untieProductBrainParts: async (_supabase: unknown, _tying: unknown, parts: string[]) => brain.unties.push(...parts)
}));
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => ({
	readBrainIndexOfParts: async () => ({ entries: [{ ...processPage, kind: 'rule', summary: '', updatedAt: '2026-11-03T09:00:00Z' }], pageCount: 1 }),
	readIndexOfProductPages: async () => {
		const { own } = brain;
		return { entries: own, pageCount: own.length };
	}
}));
vi.mock('./businessBrainReadingRuns', () => ({
	readSurroundings: async () => ({ parent: null, links: [], history: { entries: [], revisionCount: 0 } }),
	readRevisionOfPage: async () => ''
}));
vi.mock('./chatbotPageSurroundings', () => ({ keepCoveredSurroundings: async (_supabase: unknown, _covered: unknown, surroundings: unknown) => surroundings }));
vi.mock('$lib/server/businessBrain/readPageProduct', () => ({ readPageProduct: async () => brain.pageOwner }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({ readBusinessBrainPageWhole: async () => ({ ...processPage, kind: 'rule', summary: '', body: 'Open at eight.', facts: {}, source: null, updatedAt: '2026-11-03T09:00:00Z' }) }));

const [changeAction, indexAction, , pageAction] = productBrainActions;
const people = Object.fromEntries(Object.entries(standings).map(([name, standing]) => [name, standing as unknown as McpCaller]));
const change = { organisationId: 'jewel', projectId: productId, addParts: ['process', 'people'], removeParts: ['experience'] };

describe('a product brain', () => {
	beforeEach(() => {
		Object.assign(brain, { switchedOn: ['business_brain'], tied: ['process'], ties: [], unties: [], own: [], pageOwner: null });
	});

	it('is read only by someone on the product, while the brain is on for its organisation', async () => {
		expect(productBrainActions.every(isGatedByModuleRule)).toBe(true);
		expect(await indexAction.run(people.stuartOffPortal, { projectId: productId })).toBe(moduleNotOnProduct('business_brain'));
		expect(await indexAction.run(people.stuartOnPortal, { projectId: productId })).toContain('the brain of Jewel portal');
		brain.switchedOn = [];
		expect(await indexAction.run(people.stuartOnPortal, { projectId: productId })).toBe(moduleNotOnProduct('business_brain'));
	});

	it('says plainly when nothing is tied to it, and refuses a page in a part it does not read', async () => {
		brain.tied = [];
		expect(await indexAction.run(people.stuartOnPortal, { projectId: productId })).toContain('No part of');
		brain.tied = ['people'];
		expect(await pageAction.run(people.stuartOnPortal, { projectId: productId, pageId: processPage.pageId })).toBe(noSuchPageInProductBrain);
	});

	it('lists its own domain pages first, and reads its own page whether or not their part is tied, but never another product\'s', async () => {
		brain.own = [{ pageId: 'own-1', partKind: 'expertise', kind: 'entity', title: 'Work order', summary: '', updatedAt: '2026-11-12T08:00:00Z' }];
		const index = String(await indexAction.run(people.stuartOnPortal, { projectId: productId }));
		expect(index.indexOf('Work order')).toBeLessThan(index.indexOf(processPage.title));
		brain.tied = [];
		expect(await indexAction.run(people.stuartOnPortal, { projectId: productId })).toContain('Work order');
		brain.pageOwner = productId;
		expect(await pageAction.run(people.stuartOnPortal, { projectId: productId, pageId: processPage.pageId })).not.toBe(noSuchPageInProductBrain);
		brain.pageOwner = otherProductId;
		brain.tied = ['process'];
		expect(await pageAction.run(people.stuartOnPortal, { projectId: productId, pageId: processPage.pageId })).toBe(noSuchPageInProductBrain);
	});

	it('is changed only by a manager, only on the organisation\'s own product, and only where something changes', async () => {
		expect(await changeAction.run(people.stuartOnPortal, change)).toBe('No organisation you are on has Your Business Brain switched on with that id. Call list_organisations for the ones you are on.');
		expect(await changeAction.run(people.nigelManagingJewel, { ...change, projectId: otherProductId })).toBe(noSuchProductOfOrganisation);
		expect(await changeAction.run(people.nigelManagingJewel, change)).toContain('now reads these parts');
		expect(brain.ties).toEqual(['people']);
		expect(brain.unties).toEqual([]);
	});

	it('refuses a manager change that names nothing, or a part both ways', async () => {
		const asked = { organisationId: 'jewel', projectId: productId };
		expect(await changeAction.run(people.nigelManagingJewel, asked)).toContain('Name the parts to change');
		expect(await changeAction.run(people.nigelManagingJewel, { ...asked, addParts: ['process'], removeParts: ['process'] })).toContain('both tied and untied');
		expect(await changeAction.run(people.nigelOnJewel, change)).toBe(notAnOrganisationManager);
	});
});
