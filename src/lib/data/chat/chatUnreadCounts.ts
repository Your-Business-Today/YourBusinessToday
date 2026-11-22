import type { ListedChatRoom } from './chatRoomTree';

/** One room's count, as chat_unread_counts answers it: only rooms with something new are named. */
export type ChatUnreadCountRow = { room_id: string; unread_count: number | string };

/** A room as a list shows it, with how much has been said in it since the reader last looked. */
export type ChatRoomWithUnread = ListedChatRoom & { unreadCount: number };

const nothingNew = 0;

/** How many messages are new to the reader in each room, by room id. */
export function unreadCountsByRoom(rows: ChatUnreadCountRow[]): Map<string, number> {
	return new Map(rows.map((row) => [row.room_id, Number(row.unread_count)]));
}

/** Each listed room with its unread count; a room the counts do not name has nothing new. */
export function withUnreadCounts(rooms: ListedChatRoom[], counts: Map<string, number>): ChatRoomWithUnread[] {
	return rooms.map((room) => ({ ...room, unreadCount: counts.get(room.id) ?? nothingNew }));
}
