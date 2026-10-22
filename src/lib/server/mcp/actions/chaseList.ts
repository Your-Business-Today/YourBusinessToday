import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getBatonsWithOthers, type Baton } from '$lib/server/conversations/getBatonsWithOthers';
import { getMessageBodies } from '$lib/server/conversations/getMessageBodies';
import { getOpenGoalsAmong, getOpenTasksAmong } from '$lib/server/conversations/getOpenSubjects';
import { getOpenTasksRaisedBy } from '$lib/server/projects/getOpenTasksRaisedBy';
import { reachableProjectIds } from '../projectAccess';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { OpenSubject } from '$lib/server/conversations/getOpenSubjects';

/** Why someone is chased: an answer the baton waits on, or work they hold that the viewer asked for. */
export type ChaseReason = 'answer' | 'work';

/** One thing the viewer waits on from one person. */
export type ChaseItem = {
	personId: string;
	subject: OpenSubject;
	reason: ChaseReason;
	askedById: string | null;
	question: string | null;
	since: string | null;
};

/** Everything the viewer waits on from other people, with the people named. */
export type ChaseList = { items: ChaseItem[]; people: Account[] };

export async function getChaseList(caller: McpCaller): Promise<ChaseList> {
	const answers = await getAnswersAwaited(caller);
	const chasedIds = new Set(answers.map(({ subject }) => subject.id));
	const work = await getWorkAwaited(caller, chasedIds);
	const items = [...answers, ...work];
	const askerIds = items.flatMap((item) => item.askedById ?? []);
	const chasedPeopleIds = items.map((item) => item.personId);
	const people = await getAccountsById(caller.supabase, [...chasedPeopleIds, ...askerIds]);
	return { items, people };
}

async function getAnswersAwaited(caller: McpCaller): Promise<ChaseItem[]> {
	const { supabase, accountId, isStaff } = caller;
	const projectIds = reachableProjectIds(caller);
	const batons = await getBatonsWithOthers(supabase, accountId);
	const [tasks, goals, questions] = await Promise.all([
		getOpenTasksAmong(supabase, batons.flatMap((baton) => baton.taskId ?? []), projectIds),
		getOpenGoalsAmong(supabase, batons.flatMap((baton) => baton.goalId ?? []), projectIds),
		getMessageBodies(supabase, batons.map((baton) => baton.messageId), isStaff)
	]);
	return batons.flatMap((baton) => {
		const subject = tasks.get(baton.taskId ?? '') ?? goals.get(baton.goalId ?? '');
		if (subject === undefined) return [];
		return [answerAwaited(baton, subject, questions.get(baton.messageId) ?? null)];
	});
}

function answerAwaited(baton: Baton, subject: OpenSubject, question: string | null): ChaseItem {
	const { waitingOnId: personId, askedById, since } = baton;
	return { personId, subject, reason: 'answer', askedById, question, since };
}

async function getWorkAwaited(caller: McpCaller, chasedIds: Set<string>): Promise<ChaseItem[]> {
	const { supabase, accountId } = caller;
	const raised = await getOpenTasksRaisedBy(supabase, accountId, reachableProjectIds(caller));
	const notChased = raised.filter((task) => !chasedIds.has(task.id));
	const assigneesByTask = await getAssigneeIdsByTask(supabase, notChased.map((task) => task.id));
	return notChased.flatMap((subject) => {
		const assigneeIds = assigneesByTask.get(subject.id) ?? [];
		const others = assigneeIds.filter((assigneeId) => assigneeId !== accountId);
		return others.map((personId) => workAwaited(personId, subject));
	});
}

function workAwaited(personId: string, subject: OpenSubject): ChaseItem {
	return { personId, subject, reason: 'work', askedById: null, question: null, since: null };
}
