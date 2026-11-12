import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientWork, job } from './businessBrainDomainFixtures';
import { isGatedByModuleRule, moduleNotOnProduct } from '../organisationModuleGate';
import { portal, productId, stuartOffPortal, stuartOnPortal } from './productBrainFixtures';
import { productDomainActions } from './productDomainActions';
import type { McpCaller } from '../resolveMcpCaller';

const brain = vi.hoisted(() => ({ scopesRead: [] as unknown[], placesKept: [] as unknown[] }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => ({ id: organisationId, parentOrganisationId: null, name: 'Jewel' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/projects/getProject', () => ({ getProject: async () => portal }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'expertise' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', () => ({ fileBusinessBrainSource: async () => 'source-1' }));
vi.mock('$lib/server/businessBrain/readDomainPages', () => ({
	readDomainPages: async (_supabase: unknown, scope: unknown) => {
		brain.scopesRead.push(scope);
		return [];
	}
}));
vi.mock('$lib/server/businessBrain/keepDomainPage', async (importOriginal) => ({
	...(await importOriginal<object>()),
	keepDomainPage: async (_supabase: unknown, place: unknown, values: Record<string, unknown>) => {
		brain.placesKept.push(place);
		return { slug: values.slug, title: values.title, pageId: `page-${values.slug}`, outcome: 'filed' };
	}
}));

const [fileAction, readAction] = productDomainActions;
const productScope = { organisationId: 'jewel', projectId: productId };
const asked = { projectId: productId, sourceTitle: 'Portal README' };

beforeEach(() => {
	brain.scopesRead = [];
	brain.placesKept = [];
});

describe("a product's own domain", () => {
	it('is filed and read only by someone on the product, while the brain is on for its organisation', async () => {
		expect(productDomainActions.every(isGatedByModuleRule)).toBe(true);
		const offPortal = stuartOffPortal as unknown as McpCaller;
		expect(await fileAction.run(offPortal, { ...asked, contexts: [clientWork] })).toBe(moduleNotOnProduct('business_brain'));
		expect(await readAction.run(offPortal, { projectId: productId })).toBe(moduleNotOnProduct('business_brain'));
	});

	it('files every page with the product, apart from the organisation’s own domain, and links to the product’s Domain tab', async () => {
		const answer = await fileAction.run(stuartOnPortal as unknown as McpCaller, { ...asked, contexts: [clientWork], pages: [job] });
		expect(answer).toContain('Filed into the domain in the brain of Jewel portal');
		expect(answer).toContain(`/projects/${productId}/domain`);
		expect(brain.scopesRead).toEqual([expect.objectContaining(productScope)]);
		expect(brain.placesKept).toHaveLength(2);
		for (const place of brain.placesKept) expect(place).toMatchObject({ ...productScope, partId: 'expertise' });
	});

	it('reads as nothing filed yet until its first context is filed', async () => {
		const answer = await readAction.run(stuartOnPortal as unknown as McpCaller, { projectId: productId });
		expect(answer).toContain('the brain of Jewel portal, in Jewel');
		expect(answer).toContain('holds no domain yet');
		expect(brain.scopesRead).toEqual([expect.objectContaining(productScope)]);
	});
});
