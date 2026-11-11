/** How a picker is drawn: a field as wide as the side bar, or the last crumb of the top bar's trail. */
export type FramePickerLook = 'field' | 'crumb';

type FramePickerClasses = { picker: string; toggle: string; caption: string; name: string; list: string };

const fieldShape = 'flex w-full items-center gap-2 rounded border border-hairline bg-carriage-raised px-3 py-2 text-left';
const fieldHover = 'transition hover:border-hairline-strong disabled:hover:border-hairline';
const crumbShape = 'flex max-w-full items-center gap-1.5 rounded px-1.5 py-1.5 text-left';
const crumbHover = 'transition hover:bg-carriage-raised';

export const framePickerLooks: Record<FramePickerLook, FramePickerClasses> = {
	field: {
		picker: 'relative min-w-0',
		toggle: `${fieldShape} ${fieldHover}`,
		caption: 'text-xs text-chalk-subtle',
		name: 'text-sm font-semibold',
		list: 'inset-x-0'
	},
	crumb: {
		picker: 'relative -ml-1 min-w-0',
		toggle: `${crumbShape} ${crumbHover}`,
		caption: 'sr-only',
		name: 'font-display text-sm font-medium',
		list: 'left-0 w-72 max-w-[80vw]'
	}
};
