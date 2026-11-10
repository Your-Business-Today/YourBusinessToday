export const widgetCardClasses = 'flex min-w-0 flex-col gap-4 rounded-3xl border border-hairline bg-carriage p-6 sm:p-7';

export const fieldLabelClasses = 'text-sm font-medium text-chalk';

export const helperTextClasses = 'text-sm text-chalk/55';

export const fieldControlClasses =
	'min-h-12 min-w-0 rounded-2xl border border-hairline bg-night/70 text-chalk outline-none transition focus:border-go';

export const fieldSelectClasses = `${fieldControlClasses} w-full px-4`;

export const disclosureClasses = 'group rounded-2xl border border-hairline px-4 py-3 text-sm text-chalk/80';

export const disclosureSummaryClasses =
	'flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-chalk';

export const outlineButtonClasses = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border
	border-hairline px-5 font-display text-sm text-chalk transition hover:border-go hover:text-go`;

export const choiceTileClasses = `relative flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border
	border-hairline bg-night/40 px-4 py-3 text-sm transition hover:border-chalk/40
	has-[:checked]:border-go has-[:checked]:bg-go/10`;
