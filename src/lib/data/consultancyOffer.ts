export type OfferStep = {
	id: string;
	name: string;
	summary: string;
	timing: string;
	description: string;
	deliverable: string;
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
		timing: 'Week one · with the people who do the work',
		description:
			'We sit with the people who do the work and map everything that comes into your business and everything that goes out: the quote, the order, the job sheet, the invoice, the photograph that proves the work was done, and the processes that turn one into the next.',
		deliverable:
			'A written map of your business in plain English, and a fixed price for the build. Yours to keep whether or not you go further.',
		isMonthlyRetainer: false
	},
	{
		id: 'data-harness',
		name: 'Build your data harness',
		summary: 'One secure place for your data. Everyone sees only what their role allows.',
		timing: 'Weeks one and two',
		description:
			'The harness is one secure place for everything the map found. Every fact about your business has its place in it, every value is checked before it goes in, and every person sees only what their role allows.',
		deliverable:
			'Your data in one place, backed up, with the first spreadsheets and documents retired into it.',
		isMonthlyRetainer: false
	},
	{
		id: 'web-app',
		name: 'Your web app',
		summary: 'Screens over your data, built around how your team really works.',
		timing: 'Weeks two to four',
		description:
			'Screens over the harness, built around how your team really works: the jobs at the stage they are really at, the invoices that are due, the decisions that need the owner. No training course, because it works the way you already do.',
		deliverable:
			'Your own app, live and in use, at your own web address. New screens are asked for in a chat and built without touching the data underneath.',
		isMonthlyRetainer: false
	},
	{
		id: 'ai-connector',
		name: 'Your AI connector',
		summary: 'Your AI assistant can do everything the app can, from a chat.',
		timing: 'Live with the web app',
		description:
			'Your AI assistant, Claude or ChatGPT, is connected to the same system. Ask what is in flight, raise a job, chase an invoice or run the month end from a chat, and it does exactly what the app does under exactly the same permissions.',
		deliverable:
			'Everyone on your team with an assistant that knows your business, and can do nothing through it that they could not do on the screen.',
		isMonthlyRetainer: false
	},
	{
		id: 'assistant-skills',
		name: 'Skills for your assistant',
		summary: 'Your processes written as skills you can add to and change yourself.',
		timing: 'From week three · one process at a time',
		description:
			'Your processes are written down as skills your assistant follows from start to finish: the valuation put together every month, the report written from the week on site, the invoice that has to be chased. The judgement stays with your people and the repetitive work goes to the assistant.',
		deliverable:
			'A growing set of skills in your own words. Change one and it is in force from your next conversation; add one whenever the business changes.',
		isMonthlyRetainer: false
	},
	{
		id: 'run-in-the-open',
		name: 'Run it in the open',
		summary: 'Every goal and task in our project system. Watch your work being built.',
		timing: 'From the first conversation',
		description:
			'Your business gets a project in our project management system on day one. Every goal and task has its own conversation, you see what is being worked on and what comes next, and your own assistant can read the project and raise work on it.',
		deliverable:
			'Nothing hidden and nothing dropped. You always know where the build is, and you can ask for a change from anywhere.',
		isMonthlyRetainer: false
	},
	{
		id: 'change-it-however-you-want',
		name: 'Change it however you want',
		summary: 'We stay on after launch: new screens, new processes, hosting and support in one monthly fee.',
		timing: 'One monthly fee · cancel on a month’s notice',
		description:
			'Most businesses keep us on, because a business never stops changing. A new screen, a new process for the assistant, a new record the business now needs: ask for it in a chat and watch it being built. Hosting, backups and support are all inside the same fee.',
		deliverable:
			'Your app kept running, kept current and kept yours. The harness, the app and the skills belong to you, and they leave with you if you ever leave us.',
		isMonthlyRetainer: true
	}
];
