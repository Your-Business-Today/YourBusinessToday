import type { DemoBrainNote, DemoLinkedSystem } from '../../demoBusiness';
import { daysBefore } from '../datedRecords';

export function seedBrain(today: string): DemoBrainNote[] {
	const daysAgo = daysBefore(today);
	return [
		{
			id: 'NOTE-01',
			note: 'Invoices go out on the last Friday of the month. Sam raises them in Xero from the valuation Dan sends her.',
			learnedOn: daysAgo(120)
		},
		{
			id: 'NOTE-02',
			note: 'Oakwell Developments pay 30 days from invoice and never sooner. Chase on day 31 by phone to Marie, not by email.',
			learnedOn: daysAgo(95)
		},
		{
			id: 'NOTE-03',
			note: 'Quotes over £10,000 are followed up by Dan in person within two weeks of sending.',
			learnedOn: daysAgo(80)
		},
		{
			id: 'NOTE-04',
			note: "The hotel's finance team needs a purchase order number on every invoice, or it sits unpaid.",
			learnedOn: daysAgo(45)
		},
		{
			id: 'NOTE-05',
			note: 'Priya prices joinery at £62 an hour plus materials at cost plus 18 per cent.',
			learnedOn: daysAgo(30)
		}
	];
}

export const demoSystems: DemoLinkedSystem[] = [
	{
		name: 'Outlook, on Microsoft 365',
		holds: 'The shared info@ mailbox and the team calendar',
		claudeReaches: 'Reads the inbox, finds the thread for a job and drafts the reply'
	},
	{
		name: 'Xero',
		holds: 'Invoices, bills, the bank feed and the subscriptions on the cards',
		claudeReaches: 'Sees what is owed and overdue, raises an invoice and spots a bill paid twice'
	},
	{
		name: 'SharePoint, on Microsoft 365',
		holds: 'A folder per job: drawings, RAMS, photos and the signed-off valuation',
		claudeReaches: 'Finds the document for a job and the work it proves was done'
	},
	{
		name: 'HubSpot CRM',
		holds: 'Every enquiry and quote, with who it went to and when',
		claudeReaches: 'Lists the quotes waiting on an answer and chases the ones gone quiet'
	},
	{
		name: 'Your Brain Today',
		holds: 'How this business works: its rules of thumb, its people and their habits',
		claudeReaches: 'Remembers what you tell it and applies it the next time you ask'
	}
];
