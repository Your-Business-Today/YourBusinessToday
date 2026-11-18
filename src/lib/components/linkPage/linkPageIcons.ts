import type { LineIconKind } from '$lib/components/site/lineIcons';
import type { LinkPageLinkKind } from '$lib/data/linkPages/linkPage';

export const linkPageIcons: Record<LinkPageLinkKind, LineIconKind> = {
	website: 'globe',
	email: 'mail',
	telephone: 'phone'
};
