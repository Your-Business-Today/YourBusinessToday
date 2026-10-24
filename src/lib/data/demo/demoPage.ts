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
