import { describe, expect, it, vi } from 'vitest';
import { domainRunLine } from './domainRunLine';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => ({ id: organisationId, parentOrganisationId: null, name: `Organisation ${organisationId}` })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({
	getSwitchedOnModules: async (_supabase: unknown, organisationId: string) => (organisationId === 'with-brain' ? ['business_brain'] : ['books'])
}));

function personOn(...organisationIds: string[]): McpCaller {
	const organisationMemberships = organisationIds.map((organisationId) => ({ organisationId, accountId: 'person', isManager: false }));
	return { accountId: 'person', isStaff: false, organisationMemberships } as unknown as McpCaller;
}

describe('what get_current_context tells a person about setting a domain', () => {
	it('names the domain run for each organisation with Your Business Brain on', async () => {
		const line = await domainRunLine(personOn('with-brain', 'books-only'));
		expect(line).toContain('run_read_action with start_business_brain_domain_run');
		expect(line).toContain('Organisation with-brain (with-brain)');
		expect(line).not.toContain('books-only');
	});

	it('says nothing when no organisation of theirs has the brain on', async () => {
		expect(await domainRunLine(personOn('books-only'))).toBeNull();
	});
});
