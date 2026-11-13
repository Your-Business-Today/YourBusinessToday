import { beforeEach, describe, expect, it, vi } from 'vitest';
import { joineryVersion } from '$lib/server/companyContext/companyContextFixtures';
import { noContextRecordedYet, portalContextActions } from './portalContextActions';
import { notAClientContact } from '../clientContactAccess';
import { notYourOrganisation } from '../portalVisitorAccess';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const betaId = '22222222-2222-4222-8222-222222222222';
const contact = { accountId: 'contact-1', supabase: {} } as unknown as McpCaller;

const { portal, context, marking, confirming } = vi.hoisted(() => ({
	portal: { visitor: null as Record<string, unknown> | null },
	context: { reading: null as Record<string, unknown> | null },
	marking: vi.fn(),
	confirming: vi.fn()
}));

vi.mock('$lib/server/portal/getPortalVisitor', () => ({
	getPortalVisitor: async (_supabase: unknown, _accountId: string, chosenClientId: string | null) => {
		if (portal.visitor === null) return null;
		const isChosen = chosenClientId === betaId;
		return isChosen ? { ...portal.visitor, clientId: betaId, organisationName: 'Beta Ltd' } : portal.visitor;
	}
}));
vi.mock('$lib/server/companyContext/readCompanyContextOfClient', () => ({ readCompanyContextOfClient: async () => context.reading }));
vi.mock('$lib/server/companyContext/markContextPart', () => ({ markContextPart: marking }));
vi.mock('$lib/server/companyContext/confirmCompanyContext', () => ({ confirmCompanyContext: confirming }));

const acmeVisitor = {
	contactId: 'contact-row-1',
	isAdministrator: false,
	personName: 'Dana',
	emailAddress: 'dana@acme.example',
	role: 'Director',
	clientId: acmeId,
	organisationName: 'Acme Ltd',
	organisations: [{ clientId: acmeId, name: 'Acme Ltd' }, { clientId: betaId, name: 'Beta Ltd' }]
};

function run(name: string, input: Record<string, unknown> = {}) {
	const action = portalContextActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(contact, input);
}

describe("a client contact's company context through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		portal.visitor = acmeVisitor;
		context.reading = { context: joineryVersion(), changes: null, confirmation: null };
		marking.mockResolvedValue(null);
		confirming.mockResolvedValue(null);
	});

	it('reads the context of the organisation they are at, naming the others they could act for', async () => {
		const answer = String(await run('read_my_company_context'));
		expect(answer).toContain(`For Acme Ltd (clientId ${acmeId}). You are also at Beta Ltd (clientId ${betaId}): give clientId to act there.`);
		expect(answer).toContain('**Company context of Acme Ltd, version 3**');
		expect(answer).toContain('Not confirmed by the client yet');
	});

	it('acts for the organisation named, and refuses one they are not at', async () => {
		expect(await run('read_my_company_context', { clientId: betaId })).toContain('**Company context of Beta Ltd, version 3**');
		expect(await run('read_my_company_context', { clientId: '33333333-3333-4333-8333-333333333333' })).toBe(notYourOrganisation);
		expect(await run('read_my_company_context', { clientId: 'acme' })).toContain('clientId');
	});

	it('says when no context is recorded yet, and when the caller is not a client contact', async () => {
		context.reading = null;
		expect(await run('read_my_company_context')).toContain(noContextRecordedYet);
		portal.visitor = null;
		expect(await run('read_my_company_context')).toBe(notAClientContact);
	});

	it('marks a part as the person says, as the map does', async () => {
		const answer = await run('mark_context_part', { versionNumber: 3, partKey: 'quoting', reviewState: 'not_right', whatIsWrong: 'The visit comes first.' });
		expect(answer).toBe("Marked quoting not right: The visit comes first. on version 3 of Acme Ltd's company context.");
		expect(marking).toHaveBeenCalledWith({ clientId: acmeId, accountId: 'contact-1' }, { versionNumber: 3, partKey: 'quoting', reviewState: 'not_right', whatIsWrong: 'The visit comes first.' });
		expect(await run('mark_context_part', { versionNumber: '3', partKey: 'quoting', reviewState: 'right' })).toBe("Marked quoting right on version 3 of Acme Ltd's company context.");
	});

	it('refuses a mark that does not fit before writing, and passes on what the context refuses', async () => {
		expect(await run('mark_context_part', { versionNumber: 3, partKey: 'quoting', reviewState: 'not_right' })).toContain('Say what is wrong');
		expect(await run('mark_context_part', { versionNumber: 3, partKey: 'Quoting', reviewState: 'right' })).toContain('lower-case words');
		expect(marking).not.toHaveBeenCalled();
		marking.mockResolvedValue({ refusal: 'That part is not in this version of your company context.' });
		expect(await run('mark_context_part', { versionNumber: 3, partKey: 'quoting', reviewState: 'right' })).toBe('That part is not in this version of your company context.');
	});

	it('confirms the version named, telling Your Business Today, and passes on a refusal', async () => {
		expect(await run('confirm_company_context', { versionNumber: 3 })).toBe("Version 3 of Acme Ltd's company context is confirmed, and Your Business Today has been told.");
		expect(confirming).toHaveBeenCalledWith({ clientId: acmeId, accountId: 'contact-1', organisationName: 'Acme Ltd', siteOrigin: 'https://yourbusiness.today' }, 3);
		expect(await run('confirm_company_context', { versionNumber: 'three' })).toContain('whole number');
		confirming.mockResolvedValue({ refusal: 'You have already confirmed this version.' });
		expect(await run('confirm_company_context', { versionNumber: 3 })).toBe('You have already confirmed this version.');
	});
});
