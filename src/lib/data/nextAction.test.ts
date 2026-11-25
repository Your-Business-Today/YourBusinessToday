import { describe, expect, it } from 'vitest';
import { nextActionOf, type NextActionFacts, type ThreadPost } from './nextAction';

const james = 'james';
const jeremy = 'jeremy';
const nigel = 'nigel';

function post(authorAccountId: string, awaitingAccountId: string | null, minute: number): ThreadPost {
	return { authorAccountId, awaitingAccountId, createdAt: `2026-11-25T10:${String(minute).padStart(2, '0')}:00Z` };
}

function task(facts: Partial<NextActionFacts>): NextActionFacts {
	return { isDevelopment: false, assigneeIds: [], raisedBy: jeremy, posts: [], ...facts };
}

describe('nextActionOf', () => {
	it('puts the next move with everyone an open ask waits on, before the assignee', () => {
		const posts = [post(jeremy, james, 1), post(jeremy, nigel, 2)];
		const nextAction = nextActionOf(task({ assigneeIds: [jeremy], posts }));
		expect(nextAction).toEqual({ accountIds: [james, nigel], reason: 'ask' });
	});

	it('gives a build to Claude, never to the person it is assigned to', () => {
		const nextAction = nextActionOf(task({ isDevelopment: true, assigneeIds: [jeremy] }));
		expect(nextAction).toEqual({ accountIds: [], reason: 'build' });
	});

	it('still asks a person on a build when an ask waits on them', () => {
		const nextAction = nextActionOf(task({ isDevelopment: true, posts: [post(james, nigel, 1)] }));
		expect(nextAction.accountIds).toEqual([nigel]);
	});

	it('sends an answered ask back to whoever asked it until they speak again', () => {
		const answered = [post(jeremy, james, 1), post(james, null, 2)];
		expect(nextActionOf(task({ assigneeIds: [nigel], posts: answered })).accountIds).toEqual([jeremy]);
		const followedUp = [...answered, post(jeremy, null, 3)];
		expect(nextActionOf(task({ assigneeIds: [nigel], posts: followedUp })).accountIds).toEqual([nigel]);
	});

	it('leaves a task with every assignee, and with whoever raised it when nobody is assigned', () => {
		expect(nextActionOf(task({ assigneeIds: [james, nigel] })).accountIds).toEqual([james, nigel]);
		expect(nextActionOf(task({}))).toEqual({ accountIds: [jeremy], reason: 'raised' });
	});
});
