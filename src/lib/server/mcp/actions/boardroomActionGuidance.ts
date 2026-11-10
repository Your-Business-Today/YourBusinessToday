/** What a Claude is told before it runs each action of the Boardroom's agreed actions. */
export const boardroomActionGuidance = {
	record:
		'Record an action only as the meeting agreed it and your director told you: what is to be done, who owns it, ' +
		'its date only if one was given, and where it goes. With a project under this organisation it is raised as a ' +
		'task there, in the department of the job, assigned to its owner, who must be on that project; with none it ' +
		'goes on its owner’s own to-do list, and they must be on the organisation. A development task is never raised ' +
		'from a meeting: building is not asked of a person. Record it while the meeting is open and before anyone ' +
		'answers the item’s decision: the directors confirm the actions with the decision, and from its first answer ' +
		'they are fixed. While your director has paused you or asked to be asked first, you record none; they record ' +
		'it on the meeting page. Nothing is raised until the decision carries.',
	raise:
		'Run this only when your director asks for it. It raises the actions of the meeting’s carried decisions that ' +
		'are not on their board: any whose raising failed, and any whose task or to-do has been deleted since, which ' +
		'it makes again. A task someone deleted on purpose comes back, so read the list to your director first ' +
		'with read_board_meeting.'
} as const;
