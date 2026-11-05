import { canReachProject, noReachableProject } from '../projectAccess';
import { readOptionalText, textField } from '../actionTypes';
import type { AgendaFocus } from '$lib/server/agent/agendaOrder';
import type { McpCaller } from '../resolveMcpCaller';

/** What narrows the conversation, as next_turn and answer_turn both take it. */
export const turnFocusFields = {
	projectId: textField('Talk only about this project, as list_projects gives it'),
	bugsOnly: { type: 'boolean', description: 'True to raise only bugs' }
};

/** The focus as sent, or a refusal when the project is not one the caller can reach. */
export function readTurnFocus(caller: McpCaller, input: Record<string, unknown>): AgendaFocus | string {
	const projectId = readOptionalText(input, 'projectId');
	if (projectId !== null && !canReachProject(caller, projectId)) return noReachableProject;
	const isBugsOnly = input.bugsOnly === true || input.bugsOnly === 'true';
	return { projectId, isBugsOnly };
}
