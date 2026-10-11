export type OfferStep = {
	id: string;
	name: string;
	terms: string;
	description: string;
	deliverable: string;
};

export const offerDocumentPath = '/documents/your-business-today-offer.pdf';

export const consultancyOfferSteps: OfferStep[] = [
	{
		id: 'discovery',
		name: 'Map your data sources',
		terms: 'Two weeks · fixed price · no commitment to go further',
		description:
			'Every business creates its data somewhere. The sheet a quote is worked out in. The document a report is typed into. The message a job is agreed on. The photograph that proves the work was done. We spend two weeks with the people who make them and we map every source.',
		deliverable:
			'A written map of your data sources. What each one creates and who creates it and where it goes next. With it the order the harness should take them in and a fixed price for building it. Yours to keep whether or not you go further.'
	},
	{
		id: 'harness',
		name: 'Build the harness',
		terms: 'The first build stage · six to eight weeks · agreed before it starts',
		description:
			'The harness is one secure place that holds what those sources hold. Every fact about your business has its place in it and every value is checked before it goes in. Your people keep working the way they work. The harness is where the result now lives.',
		deliverable:
			'Your data in one place you can see and search with the first sources retired into it. From this stage on you have dashboards over the harness and your AI assistant connected to it. Both are live from the first week.'
	},
	{
		id: 'skills',
		name: 'Teach the assistant the processes',
		terms: 'One process a stage · agreed before it starts · stop after any stage',
		description:
			'Around the harness sit the processes. The valuation put together every month. The report written from the week on site. The chase for the invoice that is late. We write each one as a skill your own AI assistant runs from start to finish. It reads the harness for what it needs and writes the result back.',
		deliverable:
			'One process running itself. The judgement stays with the person who has it and the repetitive work goes to the assistant. Every output lands in the harness so the next process can start from it.'
	},
	{
		id: 'doors',
		name: 'Two ways in',
		terms: 'Included with the harness · grows with every skill',
		description:
			'Everything in the harness is reached in two ways. Dashboards show it the way any software would with a screen for each thing and a view for each question. Your AI assistant does exactly what the website does from inside a chat. The same actions and the same checks with no browser in the middle.',
		deliverable:
			'One set of roles deciding who may see and do what. It is enforced on both in the same way. A person who cannot approve an invoice on the screen cannot approve it through their assistant either.'
	},
	{
		id: 'run',
		name: 'Run it',
		terms: 'One monthly fee · cancel on a month’s notice',
		description:
			'Once a stage is paid for the harness and the skills are yours. So is the written record of how your business works. Most businesses ask us to stay because the work never stops changing. A new process to teach. A new record the business now needs.',
		deliverable:
			'Everything kept running and kept current. Hosting and backups and support all sit inside one monthly figure. Your project in our project management system stays open so you can raise requests and watch them being built. A standing day of change work each month.'
	}
];
