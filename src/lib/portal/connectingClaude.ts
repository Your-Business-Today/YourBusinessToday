export type ClaudePlanSteps = { plans: string; steps: string[] };

const addTheConnector =
	'Open Claude, go to Customize › Connectors and choose Add custom connector.';
const pasteTheAddress = 'Name it Your Business Today and paste the connector address above.';
const signInAsYourself = 'Choose Connect and sign in with the account you use for this portal.';

export const claudePlanSteps: ClaudePlanSteps[] = [
	{
		plans: 'Pro and Max',
		steps: [addTheConnector, pasteTheAddress, signInAsYourself]
	},
	{
		plans: 'Team and Enterprise',
		steps: [
			'An Owner or Primary Owner adds the connector for your organisation first, with the address above. On Enterprise, anyone whose role manages access to Libraries can add it too.',
			'Each person then finds Your Business Today under Customize › Connectors and connects it.',
			signInAsYourself
		]
	},
	{
		plans: 'Free',
		steps: [
			'A Free plan allows one custom connector, so remove any other first.',
			addTheConnector,
			pasteTheAddress,
			signInAsYourself
		]
	}
];

export const claudeAbilities = [
	'Raise a request on one of your projects, in your own words.',
	'Read where your requests stand and what was last said on them.',
	'Reply when YBT asks you something, without opening the portal.'
];

export const desktopNote =
	'Claude desktop shares the connectors you add on claude.ai, so connect it once there.';
