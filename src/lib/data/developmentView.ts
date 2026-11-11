import { boardQueryKeys } from '$lib/components/projects/projectAddresses';

/** The ways the Development side's work can be looked at: a backlog in priority order, or the scrum board by build stage. */
export type DevelopmentView = 'backlog' | 'board';

export const developmentViews = { backlog: 'backlog', board: 'board' } as const;

/** The view the board's address names: the scrum board when it says so, else the backlog. */
export function developmentViewOf(address: URL): DevelopmentView {
	const isBoardNamed = address.searchParams.get(boardQueryKeys.view) === developmentViews.board;
	return isBoardNamed ? developmentViews.board : developmentViews.backlog;
}
