import { goto, preloadData } from '$app/navigation';
import { isPlainClick } from './plainClick';
import type { Action } from 'svelte/action';

const controlSelector = 'a, button, form, input, select, textarea, [role="menu"]';

/**
 * A row that opens its record on a plain click anywhere on it. The controls inside the row keep
 * their own job, a modified click is left to the browser, and a drag to select text stays a selection.
 * Resting the pointer on the row fetches the record, so the view is ready by the click.
 */
export const rowLink: Action<HTMLElement, string> = (row, href) => {
	let target = href;

	function open(event: MouseEvent) {
		if (!isPlainClick(event)) return;
		const clicked = event.target as Element;
		const control = clicked.closest(controlSelector);
		if (control !== null) return;
		if (hasSelectedText()) return;
		goto(target);
	}

	function fetchAhead() {
		preloadData(target).catch(() => undefined);
	}

	row.addEventListener('click', open);
	row.addEventListener('pointerenter', fetchAhead);
	return {
		update(nextHref: string) {
			target = nextHref;
		},
		destroy() {
			row.removeEventListener('click', open);
			row.removeEventListener('pointerenter', fetchAhead);
		}
	};
};

function hasSelectedText(): boolean {
	const selection = window.getSelection();
	const selectedText = selection?.toString() ?? '';
	return selectedText !== '';
}
