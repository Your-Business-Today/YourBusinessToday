/** A message on a goal's or task's thread, as far as deciding whether a question on it is still open. */
export type ThreadMessage = {
	taskId: string | null;
	goalId: string | null;
	createdAt: string;
};

/**
 * The questions still open for one person: on each thread, the latest question put to them that
 * they have not spoken after. A question to someone else on the same thread never hides theirs.
 */
export function openQuestionsAmong<Question extends ThreadMessage>(
	questions: Question[],
	replies: ThreadMessage[]
): Question[] {
	const lastReplyByThread = latestByThread(replies);
	const unanswered = questions.filter((question) => {
		const lastReply = lastReplyByThread.get(threadOf(question));
		return lastReply === undefined || lastReply.createdAt <= question.createdAt;
	});
	return [...latestByThread(unanswered).values()].sort(byOldestFirst);
}

function latestByThread<Message extends ThreadMessage>(messages: Message[]): Map<string, Message> {
	const latest = new Map<string, Message>();
	for (const message of messages) {
		const thread = threadOf(message);
		const known = latest.get(thread);
		if (known === undefined || known.createdAt < message.createdAt) latest.set(thread, message);
	}
	return latest;
}

function threadOf(message: ThreadMessage): string {
	return message.taskId ?? message.goalId ?? '';
}

function byOldestFirst(left: ThreadMessage, right: ThreadMessage): number {
	return left.createdAt.localeCompare(right.createdAt);
}
