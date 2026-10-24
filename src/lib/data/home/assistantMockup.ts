export type AssistantLine = {
	isFromPerson: boolean;
	text: string;
	items: string[];
	footnote: string;
	actions: string[];
};

export const assistantMockupTitle = 'Your assistant';

export const assistantMockupPlaceholder = 'Ask your assistant…';

const personSays = (text: string): AssistantLine => ({
	isFromPerson: true,
	text,
	items: [],
	footnote: '',
	actions: []
});

/** The conversation in the hero's phone: invented customers, invented figures, the kind of thing an assistant does. */
export const assistantMockupConversation: AssistantLine[] = [
	personSays('Who owes us money this week?'),
	{
		isFromPerson: false,
		text: 'Three customers are past due:',
		items: ['Harbour & Co £6,200', 'Kestrel Foods £4,000', 'Bright Lane £2,200'],
		footnote: '£12,400 in total',
		actions: ['Draft reminders', 'Open invoices']
	},
	personSays('Draft the reminders'),
	{
		isFromPerson: false,
		text: 'Done. 3 reminders are ready for you to check and send.',
		items: [],
		footnote: '',
		actions: []
	}
];
