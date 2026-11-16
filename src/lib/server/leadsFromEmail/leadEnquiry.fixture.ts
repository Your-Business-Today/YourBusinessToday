import { vi } from 'vitest';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';

export const clientId = '11111111-1111-4111-8111-111111111111';
export const personId = '22222222-2222-4222-8222-222222222222';
export const filedEmailId = '33333333-3333-4333-8333-333333333333';
export const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
export const james = { id: 'staff-1', name: 'James', email: 'james@yourbusiness.today' };

export const enquiry = {
	mailbox: 'consulting@yourbusiness.today',
	messageId: '18c2f0a9b1d3e4f5',
	threadId: '18c2f0a9b1d3e4f0',
	from: 'Joanne@Acme.example',
	to: ['consulting@yourbusiness.today'],
	subject: 'Help with our bookings',
	sentAt: '2026-11-16T09:30:00Z',
	summary: 'Asks what a booking system would cost for two sites.',
	companyName: 'Acme Ltd',
	senderName: 'Joanne Smith',
	senderPhone: '01234 567890'
};

/** The register as the lead action sees it: nobody held, every write answering as it would on a new lead. */
export function standUpEmptyRegister(register: Record<string, ReturnType<typeof vi.fn>>): void {
	register.findingOwners.mockImplementation(async (_supabase: unknown, [address]: string[]) => [{ address, kind: 'nobody' }]);
	register.findingByNumber.mockResolvedValue(null);
	register.findingByName.mockResolvedValue(null);
	register.resolvingStaff.mockResolvedValue(james);
	register.creatingClient.mockResolvedValue(clientId);
	register.findingPerson.mockResolvedValue(personId);
	register.filing.mockResolvedValue({ id: filedEmailId, isAlreadyFiled: false });
	register.gettingClient.mockResolvedValue({ id: clientId, name: 'Acme Ltd' });
}
