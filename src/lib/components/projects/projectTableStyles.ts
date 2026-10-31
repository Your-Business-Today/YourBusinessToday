export type TableColumn = { label: string; isWideOnly?: boolean };

const tableClasses =
	'grid divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-carriage';

const rowClasses = 'col-span-full grid grid-cols-subgrid items-center gap-x-3 px-3 sm:px-4';

/** Every column but the project's name and its progress bar is as wide as its widest badge, so nothing runs into the column beside it. */
export const projectTableClasses = `${tableClasses} grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1fr)_auto_12rem_auto] xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_12rem_auto]`;

export const teamProjectTableClasses = `${tableClasses} grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto_12rem] xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_12rem]`;

export const projectHeaderClasses = `${rowClasses} hidden bg-night/40 py-2 font-display text-[0.65rem] tracking-widest text-chalk/40 uppercase md:grid`;

export const projectRowClasses = `${rowClasses} cursor-pointer py-2.5 transition hover:bg-night/40`;

export const wideScreenOnlyClasses = 'hidden xl:block';

/** An organisation's name is shown whole up to a width, and truncated with its full name on hover past it. */
export const organisationCellClasses = 'hidden max-w-56 xl:block';

export const projectNumberClasses = 'min-w-6 text-right font-display text-sm tabular-nums text-chalk/50';

export const projectNameClasses = 'truncate font-display text-sm font-medium text-chalk transition hover:text-go';

export const projectColumns: TableColumn[] = [
	{ label: '#' },
	{ label: 'Project' },
	{ label: 'Organisation', isWideOnly: true },
	{ label: 'Kit', isWideOnly: true },
	{ label: 'Status' },
	{ label: 'Progress' },
	{ label: '' }
];

export const teamProjectColumns: TableColumn[] = [
	{ label: '#' },
	{ label: 'Project' },
	{ label: 'Organisation', isWideOnly: true },
	{ label: 'Status' },
	{ label: 'Tasks' }
];
