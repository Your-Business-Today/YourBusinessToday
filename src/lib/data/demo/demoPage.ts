export type DemoPromise = { title: string; sentence: string };

export const demoPromises: DemoPromise[] = [
	{
		title: 'Answers, not screens',
		sentence:
			'Connect your own Claude and ask it a question. It answers from the business, not from a help page.'
	},
	{
		title: 'Money and opportunity',
		sentence:
			'Claude shows where the business is losing money or missing work, with a figure on each: ' +
			'unbilled work, overdue invoices, quotes gone quiet, subscriptions paid twice.'
	},
	{
		title: 'A second brain',
		sentence:
			'The business has its own Your Brain Today brain. Tell Claude how you work and watch it remember the next time you ask.'
	},
	{
		title: 'Everything linked',
		sentence:
			'One view of how the systems join up: email, Xero, SharePoint, the CRM, and what Claude reaches through each.'
	},
	{
		title: 'Your own system',
		sentence:
			'The real build runs on your own Microsoft 365 and Azure, built from your own folders. Nothing of yours lives on ours.'
	}
];

export type ConnectStep = { where: string; how: string };

export const connectSteps: ConnectStep[] = [
	{
		where: 'Claude on the web or the desktop app',
		how: 'Settings, then Connectors, then Add custom connector. Give it a name, paste the link above, and add it. No sign-in is asked for: the link is your key.'
	},
	{
		where: 'Claude Code',
		how: 'Run claude mcp add --transport http ybt-demo followed by the link above.'
	},
	{
		where: 'Then ask',
		how: 'Start a new chat and ask any of the questions below. Claude reads the business, finds the money and acts, all on your private copy.'
	}
];
