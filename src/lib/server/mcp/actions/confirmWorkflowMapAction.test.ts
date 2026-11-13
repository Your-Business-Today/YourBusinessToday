import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmWorkflowMapAction } from './confirmWorkflowMapAction';
import { notAClientContact } from '../clientContactAccess';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const contact = { accountId: 'contact-1', supabase: {} } as unknown as McpCaller;
const acmeVisitor = { clientId: acmeId, organisationName: 'Acme Ltd', organisations: [{ clientId: acmeId, name: 'Acme Ltd' }] };

const { portal, confirming } = vi.hoisted(() => ({ portal: { visitor: null as unknown }, confirming: vi.fn() }));

vi.mock('$lib/server/portal/getPortalVisitor', () => ({ getPortalVisitor: async () => portal.visitor }));
vi.mock('$lib/server/workflowMap/confirmWorkflowMap', () => ({ confirmWorkflowMap: confirming }));

const confirm = (input: Record<string, unknown>) => confirmWorkflowMapAction.run(contact, input);

describe("a client contact confirming their workflow map through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		portal.visitor = acmeVisitor;
		confirming.mockResolvedValue(null);
	});

	it('confirms the version the person names, for their own organisation', async () => {
		const answer = await confirm({ stage: 'after', versionNumber: '2' });
		expect(answer).toBe("Version 2 of Acme Ltd's After workflow map is confirmed, and Your Business Today has been told.");
		const confirmer = { clientId: acmeId, accountId: 'contact-1', organisationName: 'Acme Ltd', siteOrigin: expect.any(String) };
		expect(confirming).toHaveBeenCalledWith(confirmer, { stage: 'after', versionNumber: 2 });
	});

	it('passes on what the map refuses, and refuses anyone who is not a client contact', async () => {
		confirming.mockResolvedValue({ refusal: '1 station is marked not right.' });
		expect(await confirm({ stage: 'after', versionNumber: '2' })).toBe('1 station is marked not right.');
		portal.visitor = null;
		expect(await confirm({ stage: 'after', versionNumber: '2' })).toBe(notAClientContact);
	});

	it('refuses a confirmation that does not fit before confirming anything', async () => {
		expect(await confirm({ stage: 'later', versionNumber: '2' })).toContain('The map');
		expect(await confirm({ stage: 'after', versionNumber: '0' })).toContain('whole number');
		expect(confirming).not.toHaveBeenCalled();
	});
});
