export type LegalSectionSize = 'article' | 'compact';

export type LegalSectionClasses = {
	heading: string;
	paragraph: string;
	list: string;
	link: string;
};

export const legalSectionClasses: Record<LegalSectionSize, LegalSectionClasses> = {
	article: {
		heading: 'font-display text-2xl font-medium',
		paragraph: 'text-chalk/80',
		list: 'flex list-disc flex-col gap-2 pl-6 text-chalk/80',
		link: 'text-chalk underline underline-offset-4 hover:text-signal'
	},
	compact: {
		heading: 'mt-2 font-display text-sm font-medium text-chalk first:mt-0',
		paragraph: 'text-sm leading-relaxed text-chalk/70',
		list: 'flex list-disc flex-col gap-1 pl-5 text-sm text-chalk/70',
		link: 'text-sm text-chalk underline underline-offset-4 hover:text-signal'
	}
};
