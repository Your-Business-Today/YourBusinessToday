import { comparedTaskTexts } from '$lib/data/similarTasks';
import { findSimilarTasks } from '$lib/server/projects/findSimilarTasks';
import { reachableProject } from '../projectAccess';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { noSuchProject } from './describeProject';
import { similarTaskLine } from './similarTaskCheck';
import type { McpAction } from '../actionTypes';

export const similarTaskActions: McpAction[] = [
	{
		name: 'find_similar_tasks',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary: 'the open tasks on a project that look like a task you have in mind, with who raised each',
		guidance:
			'create_task runs this check itself on the project the task is raised on; call it to look before ' +
			'drafting a task, or to compare an existing one.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project the task would be raised on'),
				title: textField('The title of the task you have in mind'),
				storyWant: textField('What its user story wants, when it has one')
			},
			['projectId', 'title']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'Give the title of the task you have in mind.';
			const texts = comparedTaskTexts(title, readOptionalText(input, 'storyWant'));
			const similar = await findSimilarTasks(caller.supabase, project.id, texts);
			if (similar.length === 0) return `No open task on ${project.name} looks like "${title}".`;
			return similar.map(similarTaskLine).join('\n');
		}
	}
];
