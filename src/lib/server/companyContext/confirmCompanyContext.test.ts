import { beforeEach, describe, expect, it, vi } from 'vitest';

const doubles = vi.hoisted(() => {
	const makeDouble = vi.fn;
	return {
		insert: makeDouble(),
		findOrganisationOfClient: makeDouble(),
		findLatestVersion: makeDouble(),
		readContextParts: makeDouble(),
		recordClientEvent: makeDouble(),
		notifyContextConfirmed: makeDouble()
	};
});

const service = { from: () => ({ insert: doubles.insert }) };
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => service }));
vi.mock('$lib/server/onboarding/organisationForClient', () => ({
	findOrganisationOfClient: doubles.findOrganisationOfClient
}));
vi.mock('./findLatestVersion', async (original) => ({
	...(await original<typeof import('./findLatestVersion')>()),
	findLatestVersion: doubles.findLatestVersion
}));
vi.mock('./readContextParts', () => ({ readContextParts: doubles.readContextParts }));
vi.mock('$lib/server/clients/recordClientEvent', () => ({ recordClientEvent: doubles.recordClientEvent }));
vi.mock('./notifyContextConfirmed', () => ({ notifyContextConfirmed: doubles.notifyContextConfirmed }));

const { alreadyConfirmedVersion, confirmCompanyContext } = await import('./confirmCompanyContext');

const confirmer = {
	clientId: 'client-1',
	accountId: 'contact-1',
	organisationName: 'Oak & Ash Joinery',
	siteOrigin: 'https://ybt.example'
};
const partReviewed = (reviewState: string) => ({ key: reviewState, reviewState, whatIsWrong: null });

describe('a client confirming their company context', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.findOrganisationOfClient.mockResolvedValue('organisation-1');
		doubles.findLatestVersion.mockResolvedValue({ id: 'version-3', versionNumber: 3 });
		doubles.readContextParts.mockResolvedValue({ parts: [partReviewed('right'), partReviewed('not_checked')] });
		doubles.insert.mockResolvedValue({ error: null });
	});

	it('keeps the version as confirmed, records it on the client history and emails the staff inbox', async () => {
		expect(await confirmCompanyContext(confirmer, 3)).toBeNull();
		expect(doubles.insert).toHaveBeenCalledWith({ version_id: 'version-3', confirmed_by: 'contact-1' });
		const detail = { versionNumber: 3 };
		expect(doubles.recordClientEvent).toHaveBeenCalledWith(service, 'client-1', 'context_confirmed', detail, 'contact-1');
		expect(doubles.notifyContextConfirmed).toHaveBeenCalledWith({
			organisationName: 'Oak & Ash Joinery',
			versionNumber: 3,
			contextUrl: 'https://ybt.example/clients/client-1/context'
		});
	});

	it('refuses while a part is marked not right, and keeps nothing', async () => {
		doubles.readContextParts.mockResolvedValue({ parts: [partReviewed('right'), partReviewed('not_right')] });
		expect(await confirmCompanyContext(confirmer, 3)).toEqual({ refusal: expect.stringContaining('1 part is') });
		expect(doubles.insert).not.toHaveBeenCalled();
	});

	it('refuses a version older than the latest, so a revision is confirmed only once it is seen', async () => {
		expect(await confirmCompanyContext(confirmer, 2)).toEqual({ refusal: expect.stringContaining('Version 3') });
		expect(doubles.insert).not.toHaveBeenCalled();
	});

	it('tells nobody twice when the version is already confirmed', async () => {
		doubles.insert.mockResolvedValue({ error: { code: '23505' } });
		expect(await confirmCompanyContext(confirmer, 3)).toEqual(alreadyConfirmedVersion);
		expect(doubles.recordClientEvent).not.toHaveBeenCalled();
		expect(doubles.notifyContextConfirmed).not.toHaveBeenCalled();
	});

	it('refuses when no context has been recorded yet', async () => {
		doubles.findLatestVersion.mockResolvedValue(null);
		expect(await confirmCompanyContext(confirmer, 1)).toEqual({ refusal: expect.stringContaining('nothing to confirm') });
	});
});
