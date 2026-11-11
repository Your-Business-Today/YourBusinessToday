/** How a picker is drawn: a field as wide as the side bar, or the last crumb of the top bar's trail. */
export type FramePickerLook = 'field' | 'crumb';

type FramePickerClasses = { toggle: string; caption: string; name: string; list: string };

export const framePickerLooks: Record<FramePickerLook, FramePickerClasses> = {
	field: {
		toggle:
			'flex w-full items-center gap-2 rounded border border-hairline bg-carriage-raised px-3 py-2 text-left transition hover:border-hairline-strong disabled:hover:border-hairline',
		caption: 'text-xs text-chalk-subtle',
		name: 'text-sm font-semibold',
		list: 'inset-x-0'
	},
	crumb: {
		toggle:
			'-mx-2 flex max-w-full items-center gap-1.5 rounded px-2 py-1.5 text-left transition hover:bg-carriage-raised',
		caption: 'sr-only',
		name: 'font-display text-sm font-medium',
		list: 'left-0 w-72 max-w-[80vw]'
	}
};
