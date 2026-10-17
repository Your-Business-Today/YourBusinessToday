import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { similarTaskLine, similarTasksFor } from './similarTaskCheck';
import type { McpAction } from '../actionTypes';

export const similarTaskActions: McpAction[] = [
	{
		name: 'find_similar_tasks',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the open tasks across every project you can see that look like a task you have in mind, with who raised each',
		guidance:
			'create_task runs this check itself; call it to look before drafting a task, or to compare an existing one.',
		inputSchema: objectSchema(
			{
				title: textField('The title of the task you have in mind'),
				storyWant: textField('What its user story wants, when it has one')
			},
			['title']
		),
		run: async (caller, input) => {
			const title = readOptionalText(input, 'title');
			if (title === null) return 'Give the title of the task you have in mind.';
			const similar = await similarTasksFor(caller, `${title} ${readText(input, 'storyWant')}`);
			if (similar.length === 0) return `No open task across YBT looks like "${title}".`;
			return similar.map(similarTaskLine).join('\n');
		}
	}
];
