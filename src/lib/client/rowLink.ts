import { goto, preloadData } from '$app/navigation';
import { isPlainClick } from './plainClick';
import type { Action } from 'svelte/action';

/** Where a row takes the person: the address of its record, or what opens the record over the list. */
export type RowTarget = string | (() => void);

const controlSelector = 'a, button, form, input, select, textarea, summary, [role="menu"]';

/**
 * A row that opens its record on a plain click anywhere on it. The controls inside the row keep
 * their own job, a modified click is left to the browser, and a drag to select text stays a selection.
 * Resting the pointer on a row with an address fetches the record, so the view is ready by the click.
 */
export const rowLink: Action<HTMLElement, RowTarget> = (row, firstTarget) => {
	let target = firstTarget;

	function open(event: MouseEvent) {
		if (isOpeningPress(event)) openTarget(target);
	}

	function fetchAhead() {
		if (!isAddress(target)) return;
		preloadData(target).catch(() => undefined);
	}

	row.addEventListener('click', open);
	row.addEventListener('pointerenter', fetchAhead);
	return {
		update(nextTarget: RowTarget) {
			target = nextTarget;
		},
		destroy() {
			row.removeEventListener('click', open);
			row.removeEventListener('pointerenter', fetchAhead);
		}
	};
};

function isOpeningPress(event: MouseEvent): boolean {
	if (!isPlainClick(event)) return false;
	const clicked = event.target as Element;
	const control = clicked.closest(controlSelector);
	if (control !== null) return false;
	return !hasSelectedText();
}

function openTarget(target: RowTarget): void {
	if (isAddress(target)) {
		goto(target);
		return;
	}
	target();
}

function isAddress(target: RowTarget): target is string {
	return typeof target === 'string';
}

function hasSelectedText(): boolean {
	const selection = window.getSelection();
	const selectedText = selection?.toString() ?? '';
	return selectedText !== '';
}
