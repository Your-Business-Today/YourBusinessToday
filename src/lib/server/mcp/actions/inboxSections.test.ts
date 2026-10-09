import { describe, expect, it } from 'vitest';
import { splitInbox, waitingCountSentence } from './inboxSections';
import { awaitingKinds, postedViaChannels } from '$lib/data/conversationTurn';
import type { NamedMessage } from '$lib/server/conversations/withAuthorNames';

const jeremy = 'jeremy';
const james = 'james';

function message(body: string, awaiting: string | null): NamedMessage {
	return {
		id: body,
		goalId: null,
		taskId: 'task',
		authorAccountId: james,
		authorName: 'James',
		body,
		isInternal: false,
		postedVia: postedViaChannels.claude,
		awaiting: awaiting === null ? null : { accountId: awaiting, kind: awaitingKinds.person },
		pickedUpAt: null,
		createdAt: '2026-10-09'
	};
}

describe('the inbox sections', () => {
	it('puts only the questions that wait on the reader first, whatever the others say', () => {
		const sections = splitInbox(
			[
				message('Jeremy, which route?', jeremy),
				message('Jeremy, which route? (asked in prose only)', null),
				message('A question for James', james)
			],
			jeremy
		);
		const waiting = sections.waitingOnReader;
		expect(waiting.map((item) => item.body)).toEqual(['Jeremy, which route?']);
		expect(sections.forInformation).toHaveLength(2);
	});

	it('counts what waits on the reader in words', () => {
		expect(waitingCountSentence(splitInbox([], jeremy))).toBe('Nothing waits on you.');
		expect(waitingCountSentence(splitInbox([message('a', jeremy)], jeremy))).toBe(
			'One thing waits on you.'
		);
		expect(
			waitingCountSentence(splitInbox([message('a', jeremy), message('b', jeremy)], jeremy))
		).toBe('2 things wait on you.');
	});
});
