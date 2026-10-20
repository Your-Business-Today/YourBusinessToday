import type { DemoEmail, DemoSubscription } from '../../demoBusiness';
import { emailReceivedBefore } from '../datedRecords';

const practiceAccount = 'Direct debit, practice account';

export const practiceSubscriptions: DemoSubscription[] = [
	{ id: 'SUB-01', name: 'Microsoft 365 Business Standard, 6 seats', monthlyCost: 61.8, paidBy: practiceAccount, cancelledOn: null },
	{ id: 'SUB-02', name: 'Dext Practice', monthlyCost: 90, paidBy: practiceAccount, cancelledOn: null },
	{ id: 'SUB-03', name: 'Dext Practice', monthlyCost: 90, paidBy: "Imran's company card", cancelledOn: null },
	{ id: 'SUB-04', name: 'BrightPay Cloud', monthlyCost: 44, paidBy: practiceAccount, cancelledOn: null },
	{ id: 'SUB-05', name: 'Zoom Pro', monthlyCost: 13.99, paidBy: "Rachel's company card", cancelledOn: null },
	{ id: 'SUB-06', name: 'Zoom Pro', monthlyCost: 13.99, paidBy: "Gemma's company card", cancelledOn: null }
];

export function seedInbox(today: string): DemoEmail[] {
	const email = emailReceivedBefore(today);
	return [
		email('MAIL-01', 'Helen Moss, Aire Valley Dental Practice', 'Re: Invoice INV-3108', 2,
			'Says the invoice went to the old practice manager and asks for it to be sent again to accounts@.'),
		email('MAIL-02', 'Owen Price, Calder Studio Architects', 'Bookkeeping from November?', 3,
			'Asks whether the monthly bookkeeping quote still stands and whether the VAT returns are included.'),
		email('MAIL-03', 'Aisha Khan, Kirkgate Coffee Roasters', 'September receipts', 1,
			'Sends twelve receipt photos and asks whether anything else is missing before the VAT return.'),
		email('MAIL-04', 'HMRC online services', 'A VAT return is due', 4,
			'The VAT return for Kirkgate Coffee Roasters, quarter to September, is due by 7 November.'),
		email('MAIL-05', 'Steve Firth, Moor Lane Garage', 'Happy to go ahead', 1,
			'Accepts the monthly bookkeeping quote in principle and asks what he needs to send to get started.')
	];
}
