import { describe, expect, it } from 'vitest';
import { currentTurn, openQuestion, type TurnMessage } from './currentTurn';
import { awaitingKinds, postedViaChannels } from './conversationTurn';

const askedOf = (accountId: string) => ({ accountId, kind: awaitingKinds.person });

const james = 'james';
const jeremy = 'jeremy';
const nigel = 'nigel';

function said(author: string, createdAt: string, awaiting: string | null = null): TurnMessage {
	return {
		authorAccountId: author,
		postedVia: postedViaChannels.claude,
		awaiting: awaiting === null ? null : { accountId: awaiting, kind: awaitingKinds.person },
		pickedUpAt: null,
		createdAt
	};
}

describe('the current turn of a thread', () => {
	it('is nothing on a thread nobody has spoken on', () => {
		expect(currentTurn([])).toBeNull();
	});

	it('is the latest message when nothing asked is still open', () => {
		const turn = currentTurn([said(james, '2026-10-01'), said(jeremy, '2026-10-02')]);
		expect(turn?.authorAccountId).toBe(jeremy);
		expect(turn?.awaiting).toBeNull();
	});

	it('keeps a question open under a later work log from anyone else', () => {
		const question = said(james, '2026-10-01', jeremy);
		const turn = currentTurn([question, said(james, '2026-10-02'), said(nigel, '2026-10-03')]);
		expect(turn?.since).toBe('2026-10-01');
		expect(turn?.awaiting).toEqual(askedOf(jeremy));
	});

	it('closes a question once the person it waits on has spoken after it', () => {
		const messages = [said(james, '2026-10-01', jeremy), said(jeremy, '2026-10-02')];
		expect(openQuestion(messages)).toBeNull();
		expect(currentTurn(messages)?.since).toBe('2026-10-02');
	});

	it('takes the answer that asks something back as the new open question', () => {
		const messages = [said(james, '2026-10-01', jeremy), said(jeremy, '2026-10-02', james)];
		expect(openQuestion(messages)?.awaiting).toEqual(askedOf(james));
	});

	it('takes the newest of several open questions', () => {
		const messages = [said(james, '2026-10-01', jeremy), said(nigel, '2026-10-02', james)];
		expect(openQuestion(messages)?.createdAt).toBe('2026-10-02');
	});
});
