import { beforeEach, describe, expect, it, vi } from 'vitest';
import { kitVersionActions } from './kitVersionActions';
import { noRepositoriesYet } from './describeKitVersions';
import type { McpCaller } from '../resolveMcpCaller';

const portalId = '11111111-1111-4111-8111-111111111111';
const siteId = '22222222-2222-4222-8222-222222222222';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { kit, readNow } = vi.hoisted(() => ({ kit: { latest: '1.4.0', entries: [] as unknown[], withoutRepository: 0 }, readNow: vi.fn() }));

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/kit/kitVersions', () => ({ getLatestKitVersion: async () => kit.latest }));
vi.mock('$lib/server/kit/getKitVersionRegister', () => ({
	getKitVersionRegister: async (_supabase: unknown, _ownerId: string, latestKitVersion: string) => ({
		latestKitVersion,
		entries: kit.entries,
		projectsWithoutRepository: kit.withoutRepository
	})
}));
vi.mock('$lib/server/kit/readOwnedKitVersions', async (importOriginal) => ({ ...(await importOriginal<object>()), readOwnedKitVersions: readNow }));

const portal = { projectId: portalId, projectName: 'Portal', repositoryUrl: 'https://github.com/example/portal', kitVersion: '1.2.0', kitVersionReadAt: '2026-11-12T08:00:00Z', standing: 'behind' };
const site = { projectId: siteId, projectName: 'Site', repositoryUrl: 'https://github.com/example/site', kitVersion: '1.4.0', kitVersionReadAt: null, standing: 'current' };

function run(name: string) {
	const action = kitVersionActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, {});
}

describe('the kit version register through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		kit.latest = '1.4.0';
		kit.entries = [portal, site];
		kit.withoutRepository = 1;
	});

	it('lists each repository as the Kit versions page does, with the summary line first', async () => {
		expect(await run('read_kit_versions')).toBe(
			[
				'1 of 2 repositories on the latest kit 1.4.0; 1 behind.',
				`Portal — On kit 1.2.0, behind the latest 1.4.0. — read 12 Nov, 08:00 — https://github.com/example/portal — project ${portalId}`,
				`Site — On kit 1.4.0, the latest. — never read — https://github.com/example/site — project ${siteId}`,
				'1 more project(s) have no repository recorded, so they carry no kit.'
			].join('\n')
		);
	});

	it('says when nothing is recorded, or the latest has not been read', async () => {
		kit.entries = [];
		expect(await run('read_kit_versions')).toBe(noRepositoriesYet);
		kit.entries = [site];
		kit.latest = '';
		expect(await run('read_kit_versions')).toContain('The latest kit version has not been read yet');
	});

	it('reads the versions now and then lists them', async () => {
		readNow.mockResolvedValue({ isLatestRead: true, projectsRead: 2, projectsUnreadable: 0 });
		const answer = await run('refresh_kit_versions');
		expect(answer).toContain('Read the kit version on 2 repositories.');
		expect(answer).toContain('1 of 2 repositories on the latest kit 1.4.0; 1 behind.');
		expect(readNow).toHaveBeenCalledWith(staff.supabase, 'staff-1');
	});
});
