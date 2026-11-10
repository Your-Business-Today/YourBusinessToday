const lineClasses = 'flex min-w-0 flex-col gap-0.5 px-6 py-3 text-sm transition hover:bg-carriage-raised';
const shownLineClasses = `${lineClasses} bg-carriage-raised text-go`;
const otherLineClasses = `${lineClasses} text-chalk`;

/** A line of a page's history, marked when it is the version being read. */
export function historyLineClasses(isShown: boolean): string {
	if (isShown) return shownLineClasses;
	return otherLineClasses;
}
