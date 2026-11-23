import type { ChatRoom } from '$lib/data/chat/chatRoomRules';

type WrittenRow = { table: string; row: Record<string, unknown> };
type Called = { name: string; args: Record<string, unknown> };

export const jewel = { id: '00000000-0000-4000-8000-00000000000a', name: 'Jewel' };
export const elsewhereRoomId = '00000000-0000-4000-8000-0000000000ff';

const room = (id: string, name: string, extra: Partial<ChatRoom> = {}): ChatRoom => ({
	id,
	name,
	purpose: '',
	parentRoomId: null,
	isGeneral: false,
	isArchived: false,
	...extra
});

export const general = room('00000000-0000-4000-8000-000000000001', 'General', { isGeneral: true });
export const finance = room('00000000-0000-4000-8000-000000000002', 'Finance');
export const oldRoom = room('00000000-0000-4000-8000-000000000003', 'Old', { isArchived: true });
export const jewelRooms = [general, finance, oldRoom];
export const messageId = '00000000-0000-4000-8000-0000000000b1';

/** What the actions wrote and called through the caller's database, kept for each test to read. */
export const chatDatabase = { inserts: [] as WrittenRow[], updates: [] as WrittenRow[], calls: [] as Called[], rpcAnswer: null as unknown, rpcRefusal: null as string | null };

const storedRow = (row: Record<string, unknown>) => ({ id: messageId, created_at: '2026-11-22T09:00:00Z', is_general: false, archived_at: null, parent_room_id: null, purpose: '', ...row });

const answering = (row: Record<string, unknown>) => ({ select: () => ({ single: async () => ({ data: storedRow(row), error: null }) }) });

const financeRow = { id: finance.id, name: finance.name, purpose: finance.purpose, parent_room_id: null, is_general: false, archived_at: null };

function updating(table: string, row: Record<string, unknown>) {
	chatDatabase.updates.push({ table, row });
	const updated = { data: { ...financeRow, ...row }, error: null };
	const chain = { eq: () => chain, select: () => ({ single: async () => updated }) };
	return chain;
}

async function calling(name: string, args: Record<string, unknown>) {
	chatDatabase.calls.push({ name, args });
	if (chatDatabase.rpcRefusal !== null) return { data: null, error: { message: chatDatabase.rpcRefusal } };
	return { data: chatDatabase.rpcAnswer, error: null };
}

const database = {
	from: (table: string) => ({
		insert: (row: Record<string, unknown>) => {
			chatDatabase.inserts.push({ table, row });
			return answering(row);
		},
		update: (row: Record<string, unknown>) => updating(table, row)
	}),
	rpc: calling
};

/** Nigel on Jewel, calling through the connector with the database above, as the module gate reads a caller. */
export const nigelOnTheConnector = {
	accountId: '00000000-0000-4000-8000-0000000000c1',
	isStaff: false,
	supabase: database,
	organisationMemberships: [{ organisationId: jewel.id, accountId: '00000000-0000-4000-8000-0000000000c1', isManager: false }]
};

export function forgetWhatWasWritten(): void {
	Object.assign(chatDatabase, { inserts: [], updates: [], calls: [], rpcAnswer: null, rpcRefusal: null });
}
