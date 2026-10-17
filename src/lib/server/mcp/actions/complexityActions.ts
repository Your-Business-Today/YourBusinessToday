import { complexityCountLimits, complexityFormula, mustBeSplit } from '$lib/data/taskComplexity';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import { setTaskComplexity } from '$lib/server/projects/setTaskComplexity';
import { validateTaskComplexity } from '$lib/data/validateTaskComplexity';
import type { McpAction } from '../actionTypes';

const countRange = `${complexityCountLimits.least} to ${complexityCountLimits.most}`;

function countField(description: string) {
	return { type: 'integer', description: `${description}, ${countRange}` };
}

export const complexityActions: McpAction[] = [
	{
		name: 'record_complexity',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary:
			'record a coding task’s complexity measures, which set its story points by the stated formula',
		guidance:
			'Size every coding task the same way: count the existing views it changes, the new views ' +
			'it creates, whether the data structure changes, and the domain objects it involves. YBT ' +
			`turns them into story points: ${complexityFormula}. A person may still set the points ` +
			'by hand afterwards.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				viewsChanged: countField('Existing views the work changes'),
				newViews: countField('New views the work creates'),
				changesDataStructure: {
					type: 'boolean',
					description: 'true when a table or column is added or changed'
				},
				domainObjects: countField('Domain objects (entities) the work involves')
			},
			['taskId', 'viewsChanged', 'newViews', 'changesDataStructure', 'domainObjects']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const complexity = validateTaskComplexity({
				viewsChanged: input.viewsChanged,
				newViews: input.newViews,
				changesDataStructure: input.changesDataStructure,
				domainObjects: input.domainObjects
			});
			if (typeof complexity === 'string') return complexity;
			const storyPoints = await setTaskComplexity(caller.supabase, task.id, complexity);
			return `"${task.title}" is ${storyPoints} points from its measures.${splitAdvice(storyPoints)}`;
		}
	}
];

function splitAdvice(storyPoints: number): string {
	if (!mustBeSplit(storyPoints)) return '';
	return ' That is too big for one session: split it into tasks and size each.';
}
