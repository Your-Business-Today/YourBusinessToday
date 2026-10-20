import type { DemoBrainNote, DemoLinkedSystem } from '../../demoBusiness';
import { daysBefore } from '../datedRecords';

export function seedBrain(today: string): DemoBrainNote[] {
	const daysAgo = daysBefore(today);
	return [
		{ id: 'NOTE-01', note: "Every client's month is closed by the 10th. Imran reconciles each bank feed in Xero before then.", learnedOn: daysAgo(140) },
		{ id: 'NOTE-02', note: 'Aire Valley Dental pays by BACS on the 1st. An invoice that reaches them after the 25th waits a month.', learnedOn: daysAgo(90) },
		{ id: 'NOTE-03', note: 'Year-end work is invoiced the day the accounts go to the client for signature, never later.', learnedOn: daysAgo(70) },
		{ id: 'NOTE-04', note: 'Receipts emailed to info@ are forwarded to Dext by Josh the same day.', learnedOn: daysAgo(40) },
		{ id: 'NOTE-05', note: 'Rachel prices bookkeeping at £45 an hour, and year-end accounts from £1,200 fixed.', learnedOn: daysAgo(25) }
	];
}

export const practiceSystems: DemoLinkedSystem[] = [
	{
		name: 'Outlook, on Microsoft 365',
		holds: 'The shared info@ mailbox and the calendar of client deadlines',
		claudeReaches: 'Reads the inbox, finds the client a message is about and drafts the reply'
	},
	{
		name: 'Xero',
		holds: "The practice's own invoices and bank feed, and every client's books",
		claudeReaches: 'Sees what is owed and overdue, raises an invoice and spots a bill paid twice'
	},
	{
		name: 'Dext',
		holds: 'Every receipt and bill the clients send in',
		claudeReaches: 'Finds what is missing for a client before their VAT return'
	},
	{
		name: 'BrightPay',
		holds: 'The payrolls the practice runs for its clients',
		claudeReaches: 'Says which payrolls are due this week and who has changed'
	},
	{
		name: 'Your Brain Today',
		holds: 'How this practice works: its rules of thumb, its clients and their habits',
		claudeReaches: 'Remembers what you tell it and applies it the next time you ask'
	}
];
