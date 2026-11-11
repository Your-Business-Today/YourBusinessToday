/** The ways the Development side can be looked at: the backlog in priority order, or the scrum board by build stage. */
export type DevelopmentView = 'backlog' | 'board';

export const developmentViews = { backlog: 'backlog', board: 'board' } as const;

export const developmentViewOrder: DevelopmentView[] = [developmentViews.backlog, developmentViews.board];

export const developmentViewLabels: Record<DevelopmentView, string> = {
	backlog: 'Backlog',
	board: 'Board'
};

export const developmentViewTabs = developmentViewOrder.map((view) => ({
	key: view,
	label: developmentViewLabels[view],
	count: null
}));

/** Where the browser keeps the view a person last chose, so the side opens on it next time. */
export const developmentViewStorageKey = 'ybt.development-view';
