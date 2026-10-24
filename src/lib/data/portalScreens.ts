export type PortalScreen = {
	id: string;
	title: string;
	description: string;
	imageUrl: string;
};

export const portalScreenSize = { width: 1440, height: 900 };

export const demoPortalUrl = '/construction-demo';

const screensFolder = '/screens/construction-company';

/** Screens of the construction company's portal, taken from its demo copy, where every name and figure is invented. */
export const constructionPortalScreens: PortalScreen[] = [
	{
		id: 'owner-overview',
		title: 'Owner Overview',
		description:
			'Cash in the bank, the lowest week of the next thirteen and the forecast profit on every live job, with the decisions that need the owner listed beside them.',
		imageUrl: `${screensFolder}/owner-overview.webp`
	},
	{
		id: 'control-centre',
		title: 'Control Centre',
		description:
			'Every email to the projects mailbox lands here. The portal matches it to its project and its RFI or variation, and one person decides what happens to it.',
		imageUrl: `${screensFolder}/control-centre.webp`
	},
	{
		id: 'valuation',
		title: 'Valuation',
		description:
			'The monthly claim line by line, from valued and locked through to invoiced in Xero and paid, without a spreadsheet.',
		imageUrl: `${screensFolder}/valuation.webp`
	},
	{
		id: 'weekly-cashflow',
		title: 'Weekly Cashflow',
		description:
			'Thirteen weeks ahead, read from the bills and invoices in Xero. Move an entry to the week it will really be paid and everyone sees the same plan.',
		imageUrl: `${screensFolder}/weekly-cashflow.webp`
	},
	{
		id: 'rfis',
		title: 'RFIs',
		description:
			'Every question put to the architect or the client, with the date its answer is due. The overdue ones are flagged before they hold up the programme.',
		imageUrl: `${screensFolder}/rfis.webp`
	},
	{
		id: 'ai-skills',
		title: 'AI Skills',
		description:
			'How the team works, written down for their own Claude to follow. They change a skill here and it is in force from their next conversation.',
		imageUrl: `${screensFolder}/ai-skills.webp`
	}
];
