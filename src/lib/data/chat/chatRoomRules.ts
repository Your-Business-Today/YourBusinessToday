/** The limits on a chat room, stated once and mirrored by the checks on migration 0270's columns. */
export const chatRoomLimits = {
	longestName: 60,
	longestPurpose: 300
} as const;

/** One room of an organisation's chat, as the page reads it. */
export type ChatRoom = {
	id: string;
	name: string;
	purpose: string;
	parentRoomId: string | null;
	isGeneral: boolean;
	isArchived: boolean;
};

/** A room as it is given on the form, checked by validateChatRoomFields before anything is written. */
export type ChatRoomFields = { name: string; purpose: string; parentRoomId: string | null };

/** A room the first visit opens, before anyone has made one of their own. */
export type TemplateRoom = { name: string; purpose: string; isGeneral: boolean };

export const generalRoomName = 'General';

/** The rooms an organisation's chat starts with: General first, then a room for each part of the business. */
export const templateRooms: TemplateRoom[] = [
	{ name: generalRoomName, purpose: 'Everything the whole organisation should hear.', isGeneral: true },
	{ name: 'Operations', purpose: 'The day-to-day running of the work.', isGeneral: false },
	{ name: 'Finance', purpose: 'Money in and out: invoices, costs and the bank.', isGeneral: false },
	{ name: 'Company decisions', purpose: 'The decisions the company takes, and why.', isGeneral: false }
];

export const chatRoomFieldRefusals = {
	name: `The room's name is 1 to ${chatRoomLimits.longestName} characters.`,
	purpose: `What the room is for is at most ${chatRoomLimits.longestPurpose} characters.`
} as const;
