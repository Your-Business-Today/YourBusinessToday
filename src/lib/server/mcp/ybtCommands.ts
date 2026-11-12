import { showEverythingRequest } from '$lib/data/personRequests';

/** A command the person types in chat as /ybt-<name>, or picks from their Claude's prompt menu: what it asks their Claude to do. */
export type YbtCommand = { name: string; title: string; description: string; text: string };

export const commandPrefix = '/';
const asTheAgent = 'recording my answer with answer_turn on my yes, and carrying on one item at a time until nothing is left';

const namedCommands: YbtCommand[] = [
	{
		name: 'ybt-chat',
		title: 'YBT chat: what do I need to do?',
		description: 'Talk your Your Business Today work through one item at a time, bugs first: your Claude raises one item, records your answer and moves on.',
		text: `What do I need to do? Call the what_do_i_need_to_do tool and work as the YBT agent: raise its one item, ${asTheAgent}.`
	},
	{
		name: 'ybt-summary',
		title: 'YBT summary: what I need to do and know',
		description: 'What is new for you since you last spoke, then everything assigned to you and waiting on you, project by project: the quick decisions first, then the bigger work.',
		text:
			'Give me my YBT summary: what I need to do and know. First call read_latest_messages and tell me in two lines what is new for me ' +
			'since I last spoke. Then run the read_ybt_summary action with run_read_action, showEverything true, and walk me through it as ' +
			'its answer says: every project with what is assigned to me and waiting on me, then the quick decisions one at a time, then the bigger work.'
	},
	{
		name: 'ybt-outstanding',
		title: 'YBT outstanding: everything that needs me',
		description: 'Every action item that needs you on Your Business Today, and who to chase for what you are waiting on, person by person.',
		text:
			`What is outstanding for me? Run the whats_outstanding_for_me tool with showEverything true, as for "${showEverythingRequest}", and walk me ` +
			'through it as its answer says: every action item I must do, then who to chase, then the quick decisions one at a time, then the bigger work.'
	},
	{
		name: 'ybt-bugs',
		title: 'YBT bugs: the bugs first',
		description: 'Only the bugs on your projects, one at a time, so what is built and not working is dealt with before anything else.',
		text: `Bugs first. Call the what_do_i_need_to_do tool with bugsOnly true and work as the YBT agent on the bugs alone: raise its one bug, ${asTheAgent}.`
	},
	{
		name: 'ybt-chase',
		title: 'YBT chase: who owes me',
		description: 'Who you are waiting on and for what, person by person, with the words to chase each of them.',
		text:
			'Who owes me? Run the whats_outstanding_for_me tool with showEverything true and give me only who to chase: person by person, ' +
			'what I am waiting on from each, and the words to send them, as its answer lists them.'
	},
	{
		name: 'ybt-project',
		title: 'YBT project: how is it doing?',
		description: 'How one project truly stands: its verdict first, then the one thing that would move it.',
		text:
			'How is my project doing? If I named a project, find it with list_projects and run read_project_state on it, its verdict in one line ' +
			'first and then the one thing that would move it. If I did not name one, list my projects and ask which.'
	},
	{
		name: 'ybt-raise',
		title: 'YBT raise: make this a task',
		description: 'Turn what you just described into a task on the right project, a bug as FIX: or a feature as a user story, on your yes.',
		text:
			'Raise what I just described as a task. Call find_tasks on the project it belongs to first and work on the task you find; when nothing ' +
			'matches, draft it as the doctrine says, a bug as "FIX: <what is wrong>" or a feature as a user story, show it to me, and create it ' +
			'with create_task on my yes, then read it back with read_task.'
	},
	{
		name: 'ybt-tie-off',
		title: 'YBT tie-off: close this session’s task',
		description: 'Tie the task this chat worked off, so the chat can be archived: what is unfinished becomes its own task, every open question an ask, and the work log goes on the task.',
		text:
			'Tie this session’s task off as the doctrine says: raise anything it asked for that is not finished as a task of its own, post every ' +
			'open question as a message waiting on the person who answers it, post one work log on the task, mark it done unless its pull request ' +
			'will, and tell me the chat can be archived, naming the tasks that carry the rest and who has them.'
	}
];

/** Each command as the context and the help command list it: the tag, then what it does. */
export function describeYbtCommands(): string {
	return namedCommands.map((command) => `${commandPrefix}${command.name} — ${command.description}`).join('\n');
}

const helpCommand: YbtCommand = {
	name: 'ybt-help',
	title: 'YBT help: the commands',
	description: 'The /ybt- commands you can type in any chat with your Claude, and what each does.',
	text: `Show me the YBT commands. They are:\n${describeYbtCommands()}\n${commandPrefix}ybt-help — this list.\nList them for me as they are, one a line, and say I can type any of them in any chat.`
};

export const ybtCommands: YbtCommand[] = [...namedCommands, helpCommand];

/** The line of the current context that teaches a Claude the typed commands, so they work in any chat, not only from the prompt menu. */
export const ybtCommandsDoctrine =
	`Commands: a message that is one of these tags, or starts with one, is a command — do what it asks, the same as the prompt of that name ` +
	`in the menu. ${ybtCommands.map((command) => `${commandPrefix}${command.name}`).join(', ')}. ` +
	`Each one is described by the ${commandPrefix}ybt-help prompt and in the prompts list.`;
