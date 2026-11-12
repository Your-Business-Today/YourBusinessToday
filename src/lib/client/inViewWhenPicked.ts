import type { Action } from 'svelte/action';

/** Where a row of tabs scrolls sideways, as on a phone, a tab is brought into view whenever it is the picked one. */
export const inViewWhenPicked: Action<HTMLElement, boolean> = (tab, isPicked) => {
	bringIntoItsRow(tab, isPicked);
	return { update: (isNowPicked: boolean) => bringIntoItsRow(tab, isNowPicked) };
};

function bringIntoItsRow(tab: HTMLElement, isPicked: boolean): void {
	const row = tab.parentElement;
	if (!isPicked || row === null) return;
	const rowBox = row.getBoundingClientRect();
	const tabBox = tab.getBoundingClientRect();
	const hiddenPastTheEnd = Math.max(tabBox.right - rowBox.right, 0);
	const hiddenBeforeTheStart = Math.max(rowBox.left - tabBox.left, 0);
	row.scrollLeft += hiddenPastTheEnd - hiddenBeforeTheStart;
}
