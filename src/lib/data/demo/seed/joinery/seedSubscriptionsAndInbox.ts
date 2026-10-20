import type { DemoEmail, DemoSubscription } from '../../demoBusiness';
import { emailReceivedBefore } from '../datedRecords';

const companyAccount = 'Direct debit, company account';

export const demoSubscriptions: DemoSubscription[] = [
	{ id: 'SUB-01', name: 'Microsoft 365 Business Standard, 12 seats', monthlyCost: 123.6, paidBy: companyAccount, cancelledOn: null },
	{ id: 'SUB-02', name: 'Xero Standard', monthlyCost: 33, paidBy: companyAccount, cancelledOn: null },
	{ id: 'SUB-03', name: 'Adobe Acrobat Pro', monthlyCost: 15.17, paidBy: "Sam's company card", cancelledOn: null },
	{ id: 'SUB-04', name: 'Adobe Acrobat Pro', monthlyCost: 15.17, paidBy: "Dan's company card", cancelledOn: null },
	{ id: 'SUB-05', name: 'Dropbox Plus', monthlyCost: 9.99, paidBy: "Priya's company card", cancelledOn: null },
	{ id: 'SUB-06', name: 'Dropbox Plus', monthlyCost: 9.99, paidBy: "Lee's company card", cancelledOn: null },
	{ id: 'SUB-07', name: 'SketchUp Pro', monthlyCost: 24, paidBy: "Priya's company card", cancelledOn: null }
];

export function seedInbox(today: string): DemoEmail[] {
	const email = emailReceivedBefore(today);
	return [
		email('MAIL-01', 'Tom Ashby, Bristol Harbour Hotel', 'Re: Invoice INV-1041', 3,
			'Asks for the purchase order number to be added to INV-1041 before finance will release payment.'),
		email('MAIL-02', 'Ella Caldwell, Caldwell & Finch Architects', 'Queen Square panelling, any update?', 2,
			'Asks whether the boardroom panelling quote still stands and when work could start.'),
		email('MAIL-03', 'Marie Holt, Oakwell Developments', 'Plot 6 wardrobes: ready to go ahead', 1,
			'Accepts the Plot 6 wardrobe quote in principle and asks for a start date.'),
		email('MAIL-04', 'Westcountry Timber Supplies', 'Price increase from 1 November', 4,
			'Hardwood prices rise by six per cent from 1 November; orders placed before then hold the old price.'),
		email('MAIL-05', 'Jo Bennett, Meadow Lane Primary School', 'Thank you, and the hall cupboards', 6,
			'Thanks the team for the library work and asks whether the hall storage quote is still available.')
	];
}
