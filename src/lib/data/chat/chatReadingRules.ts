import { chatMessageLimits } from './chatMessageRules';

/** How much of a room a person's Claude reads in one go: never more than the room on the site shows. */
export const chatReadingLimits = {
	mostMessagesRead: chatMessageLimits.latestMessagesShown,
	usualMessagesRead: 50
} as const;

/** What a reading of a room spans: what is new to the reader, or the room's latest messages whoever has read them. */
export const chatReadingSpans = { unread: 'unread', all: 'all' } as const;

export type ChatReadingSince = (typeof chatReadingSpans)[keyof typeof chatReadingSpans];

/** What a reading asks for, checked by validateChatReading before anything is read. */
export type ChatReadingAsked = { since: ChatReadingSince; limit: number };

export const chatReadingRefusals = {
	since: `since is ${chatReadingSpans.unread} or ${chatReadingSpans.all}; leave it out for ${chatReadingSpans.unread}.`,
	limit: `limit is a whole number of messages from 1 to ${chatReadingLimits.mostMessagesRead}; leave it out for ${chatReadingLimits.usualMessagesRead}.`
} as const;
