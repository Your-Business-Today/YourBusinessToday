/** A message on a task's thread, as far as the asks on it go: who wrote it, who it waits on, when. */
export type ThreadPost = { authorAccountId: string; awaitingAccountId: string | null; createdAt: string };

type Ask = ThreadPost & { awaitingAccountId: string };

/** Everyone an ask on the thread still waits on: they have not spoken on it since they were asked. */
export function openAskedIds(posts: ThreadPost[]): string[] {
	const openAsks = asksOf(posts).filter((ask) => answerTo(ask, posts) === null);
	return distinct(openAsks.map((ask) => ask.awaitingAccountId));
}

/** Everyone whose ask was answered and who has not spoken on the thread since the answer. */
export function returnedAskerIds(posts: ThreadPost[]): string[] {
	const returned = asksOf(posts).filter((ask) => isBackWithAsker(ask, posts));
	return distinct(returned.map((ask) => ask.authorAccountId));
}

function asksOf(posts: ThreadPost[]): Ask[] {
	return posts.filter((post): post is Ask => post.awaitingAccountId !== null);
}

function answerTo(ask: Ask, posts: ThreadPost[]): ThreadPost | null {
	const answers = postsAfter(ask.createdAt, posts).filter((post) => post.authorAccountId === ask.awaitingAccountId);
	return answers[0] ?? null;
}

function isBackWithAsker(ask: Ask, posts: ThreadPost[]): boolean {
	const answer = answerTo(ask, posts);
	if (answer === null) return false;
	const askerPosts = postsAfter(answer.createdAt, posts).filter((post) => post.authorAccountId === ask.authorAccountId);
	return askerPosts.length === 0;
}

function postsAfter(moment: string, posts: ThreadPost[]): ThreadPost[] {
	return posts.filter((post) => post.createdAt > moment).sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function distinct(accountIds: string[]): string[] {
	return [...new Set(accountIds)];
}

/** A thread's messages as the asks on it are read: who wrote each, who it waits on, when. */
export function threadPostsOf(messages: { authorAccountId: string; awaiting: { accountId: string } | null; createdAt: string }[]): ThreadPost[] {
	return messages.map(({ authorAccountId, awaiting, createdAt }) => ({
		authorAccountId,
		awaitingAccountId: awaiting?.accountId ?? null,
		createdAt
	}));
}
