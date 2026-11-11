/** The ways the Internal work side can be looked at, as monday.com offers them. */
export type InternalWorkView = 'table' | 'statusBoard' | 'calendar';

export const internalWorkViews = {
	table: 'table',
	statusBoard: 'statusBoard',
	calendar: 'calendar'
} as const;

export const internalWorkViewOrder: InternalWorkView[] = [
	internalWorkViews.table,
	internalWorkViews.statusBoard,
	internalWorkViews.calendar
];

export const internalWorkViewLabels: Record<InternalWorkView, string> = {
	table: 'Table',
	statusBoard: 'Status board',
	calendar: 'Calendar'
};

/** Where the browser keeps the view a person last chose, so the side opens on it next time. */
export const internalWorkViewStorageKey = 'ybt.internal-work-view';
