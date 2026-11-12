import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blueprintRefreshActions } from './blueprintRefreshActions';
import { noSuchProject } from './describeProject';
import type { McpCaller } from '../resolveMcpCaller';

const portalId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const portal = { id: portalId, name: 'Portal', repositoryUrl: 'https://github.com/example/portal', defaultBranch: 'main' };
const staff = { accountId: 'staff-1', ownedProjectIds: [portalId], memberProjectIds: [], supabase: {} } as unknown as McpCaller;

const { repositoryRead } = vi.hoisted(() => ({ repositoryRead: vi.fn() }));

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/projects/getProject', () => ({ getProject: async (_supabase: unknown, id: string) => (id === portalId ? portal : null) }));
vi.mock('$lib/server/blueprint/readProjectBlueprint', async (importOriginal) => ({ ...(await importOriginal<object>()), readProjectBlueprint: repositoryRead }));

function run(input: Record<string, unknown>) {
	const [refreshBlueprint] = blueprintRefreshActions;
	return refreshBlueprint.run(staff, input);
}

describe('reading a project blueprint again through the connector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('reads the repository again and says what it found, as the Domain page does', async () => {
		repositoryRead.mockResolvedValue({ kind: 'read', blueprint: { domain: null, siteMap: null, mcpMap: {}, readAtCommit: 'main', readAt: '' } });
		expect(await run({ projectId: portalId })).toBe('Read 0 entities and 0 screens from the repository.');
		expect(repositoryRead).toHaveBeenCalledWith(staff.supabase, portal);
		repositoryRead.mockResolvedValue({ kind: 'unreadable' });
		expect(await run({ projectId: portalId })).toContain('The repository could not be read.');
	});

	it('reads nothing for a project the caller is not on', async () => {
		expect(await run({ projectId: otherId })).toBe(noSuchProject);
		expect(repositoryRead).not.toHaveBeenCalled();
	});
});
