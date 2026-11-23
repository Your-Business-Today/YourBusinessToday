import type { ActionArea } from '$lib/server/mcp/actionTypes';

/** Each area of the connector in the words of the site, the books and accounts first since they matter most to review. */
export const skillAreaLabels: Record<ActionArea, string> = {
	books: 'Accounts',
	organisations: 'Organisations',
	business_brain: 'Your Business Brain',
	brand: 'Brand',
	boardroom: 'Boardroom',
	news: 'Business News',
	chat: 'Chat',
	clients: 'Clients',
	patches: 'Territories',
	projects: 'Projects',
	goals: 'Goals',
	tasks: 'Tasks',
	conversations: 'Conversations',
	support: 'Support',
	account: 'Your account'
};

export const skillAreaOrder = Object.keys(skillAreaLabels) as ActionArea[];
