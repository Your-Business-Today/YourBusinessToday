import { reachableTask } from '../projectAccess';
import { addAcceptanceCriterion } from '$lib/server/projects/addAcceptanceCriterion';
import { deleteAcceptanceCriterion } from '$lib/server/projects/deleteAcceptanceCriterion';
import { getTaskAcceptanceCriteria } from '$lib/server/projects/getTaskAcceptanceCriteria';
import { noSuchTask } from './describeTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { setCriterionMet } from '$lib/server/projects/setCriterionMet';
import type { AcceptanceCriterion } from '$lib/server/projects/criterionRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const taskIdField = textField('The task id');

const criterionIdField = textField('The criterion id, as read_task gives it');

export const acceptanceCriterionActions: McpAction[] = [
	{
		name: 'add_acceptance_criterion',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'add one thing that must be true before a task counts as done',
		inputSchema: objectSchema(
			{ taskId: taskIdField, description: textField('What must be true') },
			['taskId', 'description']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const description = readOptionalText(input, 'description');
			if (description === null) return 'A criterion needs a description of what must be true.';
			await addAcceptanceCriterion(caller.supabase, task.id, description);
			return `"${task.title}" now also has to satisfy: ${description}`;
		}
	},
	{
		name: 'set_acceptance_criterion_met',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'tick or untick one acceptance criterion on a task',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				criterionId: criterionIdField,
				isMet: { type: 'boolean', description: 'True when it now holds' }
			},
			['taskId', 'criterionId', 'isMet']
		),
		run: async (caller, input) => {
			const criterion = await findCriterionOnTask(caller, input);
			if (typeof criterion === 'string') return criterion;
			const isMet = readIsMet(input);
			await setCriterionMet(caller.supabase, criterion.id, isMet);
			return `${criterion.description} — ${isMet ? 'met' : 'not met'}.`;
		}
	},
	{
		name: 'delete_acceptance_criterion',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'drop one acceptance criterion from a task',
		inputSchema: objectSchema({ taskId: taskIdField, criterionId: criterionIdField }, [
			'taskId',
			'criterionId'
		]),
		run: async (caller, input) => {
			const criterion = await findCriterionOnTask(caller, input);
			if (typeof criterion === 'string') return criterion;
			await deleteAcceptanceCriterion(caller.supabase, criterion.id);
			return `Dropped: ${criterion.description}`;
		}
	}
];

function readIsMet(input: Record<string, unknown>): boolean {
	return input.isMet === true || input.isMet === 'true';
}

async function findCriterionOnTask(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<AcceptanceCriterion | string> {
	const task = await reachableTask(caller, readText(input, 'taskId'));
	if (task === null) return noSuchTask;
	const criteria = await getTaskAcceptanceCriteria(caller.supabase, task.id);
	const criterionId = readText(input, 'criterionId');
	const criterion = criteria.find((candidate) => candidate.id === criterionId);
	if (criterion === undefined) return chooseAnotherCriterion(criteria);
	return criterion;
}

function chooseAnotherCriterion(criteria: AcceptanceCriterion[]): string {
	if (criteria.length === 0) return 'That task has no acceptance criteria yet.';
	return 'That task has no criterion with that id. Call read_task to see the ids it has.';
}
