export type OfferStep = {
	id: string;
	name: string;
	summary: string;
	isMonthlyRetainer: boolean;
};

export const offerDocumentPath = '/documents/your-business-today-offer.pdf';

export const monthlyRetainerLabel = 'Monthly retainer';

export const buildTimeline = '2–4 weeks';

/** The seven things we do for a business, from the first conversation to long after launch, as Nigel's design tells them. */
export const consultancyOfferSteps: OfferStep[] = [
	{
		id: 'map-data-sources',
		name: 'Map your data sources',
		summary: 'Everything coming in and going out, and the processes in between.',
		isMonthlyRetainer: false
	},
	{
		id: 'data-harness',
		name: 'Build your data harness',
		summary: 'One secure place for your data. Everyone sees only what their role allows.',
		isMonthlyRetainer: false
	},
	{
		id: 'web-app',
		name: 'Your web app',
		summary: 'Screens over your data, built around how your team really works.',
		isMonthlyRetainer: false
	},
	{
		id: 'ai-connector',
		name: 'Your AI connector',
		summary: 'Your AI assistant can do everything the app can, from a chat.',
		isMonthlyRetainer: false
	},
	{
		id: 'assistant-skills',
		name: 'Skills for your assistant',
		summary: 'Your processes written as skills you can add to and change yourself.',
		isMonthlyRetainer: false
	},
	{
		id: 'run-in-the-open',
		name: 'Run it in the open',
		summary: 'Every goal and task in our project system. Watch your work being built.',
		isMonthlyRetainer: false
	},
	{
		id: 'change-it-however-you-want',
		name: 'Change it however you want',
		summary: 'We stay on after launch: new screens, new processes, hosting and support in one monthly fee.',
		isMonthlyRetainer: true
	}
];
