import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { repositoryDoorLimits } from '$lib/server/productRepository/repositoryDoorLimits';
import { siteMapRunActions } from './siteMapRunActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const headCommit = '0123456789abcdef0123456789abcdef01234567';
const product = { id: 'product-1', name: 'Board', organisationId: 'organisation-1', repositoryUrl: 'https://github.com/owner/board', defaultBranch: 'main' };
const station = { key: 'raise-an-invoice', name: 'Raise an invoice', productId: product.id };
const otherStation = { key: 'chase-payment', name: 'Chase payment', productId: null };

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/projects/getProject', () => ({ getProject: async () => product }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async () => ({ name: 'Jewel' }) }));
vi.mock('$lib/server/blueprint/getProjectBlueprint', () => ({ getProjectBlueprint: async () => ({ siteMap: { screens: [{ route: '/projects' }] } }) }));
vi.mock('$lib/server/journeyMap/readLatestJourneyMap', () => ({
	readLatestJourneyMap: async () => ({ versionNumber: 2, commit: 'abcdef1234', views: [{}, {}], journeys: [{}] })
}));
vi.mock('$lib/server/workflowMap/readLatestWorkflowMap', () => ({
	readLatestWorkflowMap: async (_supabase: unknown, _organisationId: string, stage: string) =>
		stage === 'after' ? { stage, versionNumber: 3, lines: [{ name: 'Accounts', stations: [station, otherStation] }] } : null
}));

const caller = { ownedProjectIds: [product.id], memberProjectIds: [], supabase: {} } as unknown as McpCaller;
const fetched: string[] = [];

function actionNamed(name: string): McpAction {
	const action = siteMapRunActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action ${name}`);
	return action;
}

function githubAnswering(fileText: string) {
	return async (address: string) => {
		fetched.push(address);
		if (address.includes('/commits/')) return Response.json({ sha: headCommit });
		if (address.includes('/contents/src?')) return Response.json([{ name: 'routes', path: 'src/routes', type: 'dir' }, { name: 'app.html', path: 'src/app.html', type: 'file' }]);
		return new Response(fileText);
	};
}

beforeEach(() => {
	fetched.length = 0;
	vi.stubGlobal('fetch', githubAnswering('# Board'));
});
afterEach(() => vi.unstubAllGlobals());

describe('the "map the site" run', () => {
	it('answers the walk, fitted to the commit, the journeys filed, the site definition and the stations', async () => {
		const walk = String(await actionNamed('start_site_map_run').run(caller, { projectId: product.id }));
		expect(walk).toContain(`at commit ${headCommit}, the head of main`);
		expect(walk).toContain('version 2, read from commit abcdef1');
		expect(walk).toContain('tools/refactor/site-definition.md drew one screen');
		expect(walk).toContain('raise-an-invoice (Raise an invoice, Accounts)');
		expect(walk).not.toContain('chase-payment');
		expect(walk).toContain('every view that is on no journey, and every journey step nothing links to');
		expect(walk).toContain(`file_project_site_map with projectId ${product.id}, commit ${headCommit}`);
	});

	it("refuses a product the caller is not on", async () => {
		const answer = await actionNamed('start_site_map_run').run(caller, { projectId: 'someone-elses' });
		expect(answer).toContain('No project');
	});
});

describe("the doors onto a product's repository", () => {
	it("lists a folder of the product's own repository, folders marked", async () => {
		const answer = String(await actionNamed('list_product_repository_folder').run(caller, { projectId: product.id, path: 'src', commit: 'abcdef1' }));
		expect(fetched).toEqual(['https://api.github.com/repos/owner/board/contents/src?ref=abcdef1']);
		expect(answer).toContain('src/ in Board\'s repository at commit abcdef1, 2 items');
		expect(answer).toContain('- src/routes/');
		expect(answer).toContain('- src/app.html');
	});

	it('reads a file at the head of the default branch', async () => {
		const answer = String(await actionNamed('read_product_repository_file').run(caller, { projectId: product.id, path: 'README.md' }));
		expect(fetched).toEqual(['https://api.github.com/repos/owner/board/contents/README.md?ref=main']);
		expect(answer).toContain('README.md in Board\'s repository at the head of main, 7 characters:\n\n# Board');
	});

	it('gives the first part of a file longer than a call returns, and says so', async () => {
		vi.stubGlobal('fetch', githubAnswering('x'.repeat(repositoryDoorLimits.mostFileCharacters + 10)));
		const answer = String(await actionNamed('read_product_repository_file').run(caller, { projectId: product.id, path: 'bundle.js' }));
		expect(answer).toContain(`only the first ${repositoryDoorLimits.mostFileCharacters} are here`);
		expect(answer.endsWith('x'.repeat(10))).toBe(true);
		expect(answer.length).toBeLessThan(repositoryDoorLimits.mostFileCharacters + 400);
	});

	it("refuses another's product and a path that climbs out, without asking GitHub", async () => {
		const listFolder = actionNamed('list_product_repository_folder');
		expect(await listFolder.run(caller, { projectId: 'someone-elses' })).toContain('No project');
		expect(await listFolder.run(caller, { projectId: product.id, path: '../../other/repository' })).toContain('holds . or ..');
		expect(fetched).toEqual([]);
	});
});
