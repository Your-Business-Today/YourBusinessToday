import { beforeEach, describe, expect, it, vi } from 'vitest';
import { boardJourneyMapInput } from '$lib/server/journeyMap/journeyMapFixtures';
import { describeSiteMap } from './describeBlueprint';
import { projectBlueprintActions } from './projectBlueprintActions';
import { projectJourneyMapActions } from './projectJourneyMapActions';
import { readLatestJourneyMap } from '$lib/server/journeyMap/readLatestJourneyMap';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { SiteMap } from '$lib/data/blueprint/siteMap';

const product = { id: 'product-1', name: 'Board' };
const siteDefinition: SiteMap = {
	screens: [{ route: '/projects', viewFile: 'src/routes/projects/+page.svelte', entityName: null, layout: 'Table' }]
} as unknown as SiteMap;

vi.mock('$lib/server/projects/getProject', () => ({ getProject: async () => product }));
vi.mock('$lib/server/blueprint/getProjectBlueprint', () => ({
	getProjectBlueprint: async () => ({ siteMap: siteDefinition })
}));

type FiledVersion = Record<string, unknown>;

const fileFunction = 'file_project_site_map';

/** The two database functions as migration 0211 defines them: each filing numbered, the latest read back whole. */
function databaseOfFilings(filings: FiledVersion[]) {
	return {
		rpc: async (name: string, parameters: Record<string, unknown>) => {
			if (name === fileFunction) {
				filings.push({ ...(parameters.site_map as FiledVersion), versionNumber: filings.length + 1, filedAt: '2026-11-13T05:00:00Z' });
				return { data: filings.length, error: null };
			}
			return { data: filings.at(-1) ?? null, error: null };
		}
	};
}

function callerOn(filings: FiledVersion[]): McpCaller {
	const supabase = databaseOfFilings(filings);
	return { accountId: 'account-1', ownedProjectIds: [product.id], memberProjectIds: [], supabase } as unknown as McpCaller;
}

function actionNamed(actions: McpAction[], name: string): McpAction {
	const action = actions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action ${name}`);
	return action;
}

const fileAction = actionNamed(projectJourneyMapActions, 'file_project_site_map');
const readAction = actionNamed(projectBlueprintActions, 'read_project_site_map');

describe("a product's journey map, filed and read back through the connector", () => {
	let filings: FiledVersion[];
	beforeEach(() => {
		filings = [];
	});

	it('files a whole version and reads it back the same', async () => {
		const caller = callerOn(filings);
		const answer = await fileAction.run(caller, { projectId: product.id, ...boardJourneyMapInput() });
		expect(answer).toBe("Filed version 1 of Board's site map from commit 4f5381d0a1: 4 views, 3 links, 2 entry points, 2 journeys.");
		const readBack = await readLatestJourneyMap(caller.supabase, product.id);
		expect(readBack).toEqual({ ...boardJourneyMapInput(), versionNumber: 1, filedAt: '2026-11-13T05:00:00Z' });
	});

	it('refuses a step at a view the version does not hold, and files nothing', async () => {
		const input = boardJourneyMapInput();
		(input.journeys as Record<string, unknown>[])[0].steps = [{ route: '/gone' }];
		const answer = await fileAction.run(callerOn(filings), { projectId: product.id, ...input });
		expect(answer).toContain('is not the route of a view in this version');
		expect(filings).toHaveLength(0);
	});

	it('answers read_project_site_map with the journeys once they are filed', async () => {
		const caller = callerOn(filings);
		await fileAction.run(caller, { projectId: product.id, ...boardJourneyMapInput() });
		const everyView = String(await readAction.run(caller, { projectId: product.id }));
		expect(everyView).toContain('Board site map, version 1, read from commit 4f5381d');
		expect(everyView).toContain('- Work a task (work-a-task): /sign-in → /projects → /projects/{projectId} → /projects/{projectId}/tasks/{taskId}. Carries out station plan-the-work.');
		const oneView = String(await readAction.run(caller, { projectId: product.id, route: '/projects' }));
		expect(oneView).toContain('- Work a task (Owner), step 2 of 4: picks the project');
		expect(oneView).toContain('Drawn by src/routes/projects/+page.svelte.');
	});

	it('answers read_project_site_map exactly as before for a product with none filed', async () => {
		const caller = callerOn(filings);
		expect(await readAction.run(caller, { projectId: product.id })).toBe(describeSiteMap(siteDefinition, product.name, null));
		const oneScreen = await readAction.run(caller, { projectId: product.id, route: '/projects' });
		expect(oneScreen).toBe(describeSiteMap(siteDefinition, product.name, '/projects'));
	});
});
