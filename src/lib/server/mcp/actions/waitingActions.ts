import { describeOwedTasks } from './describeOwedTasks';
import { describeWaitingQuestions } from './describeWaitingQuestions';
import { getOwedTasks } from './owedTasks';
import { getWaitingQuestionsFor } from './waitingQuestionsFor';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const titleNameField = textField(
	'The first name people write in task titles for the person, such as Jeremy — leave ' +
		'out to use the first word of their account name'
);

const everythingHeading = 'Everything that needs you, across every project you are on.';

export const waitingActions: McpAction[] = [
	{
		name: 'list_waiting_on_me',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'everything that needs you in one answer — the questions waiting on you, the open tasks ' +
			'assigned to you (your own promises among them) and the open tasks titled with your name — ' +
			'without moving the read marker',
		guidance:
			'Use it on a routine check, or whenever the person asks what needs them or what they owe: ' +
			'it reads only, so calling it again gives the same answer until something changes. Each ' +
			'question names the project, the goal or task, who asked and when; each task names its ' +
			'project and the latest message on it, with its date. Answer a question with post_message ' +
			'on the same goal or task; it leaves the list once the person it waits on has spoken there, ' +
			'or once its task is done. A task leaves it once it is done. read_latest_messages is still ' +
			'how new messages are read.',
		inputSchema: objectSchema({
			name: titleNameField
		}),
		run: async (caller, input) => {
			const questions = await describeQuestions(caller);
			const owed = await getOwedTasks(caller, readOptionalText(input, 'name'));
			return [everythingHeading, '', questions, '', ...describeOwedTasks(owed)].join('\n');
		}
	}
];

async function describeQuestions(caller: McpCaller): Promise<string> {
	const { questions, askers } = await getWaitingQuestionsFor(caller);
	return describeWaitingQuestions(questions, askers, caller.accountId);
}
