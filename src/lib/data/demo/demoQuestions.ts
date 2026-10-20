import { DemoKind, type DemoKindValue } from './demoKinds';

/** What a prospect might ask their Claude, in the words of each kind of business. */
export const demoQuestions: Record<DemoKindValue, string[]> = {
	[DemoKind.construction]: [
		'Where is this business losing money right now?',
		'Which invoices are overdue, and who do I chase first?',
		'Raise the invoice for the work done on Plot 4.',
		'Which quotes have gone quiet? Follow up the biggest one.',
		'Are we paying for anything twice? Cancel the spare.',
		'What is waiting in the inbox that needs a reply today?',
		'How does this business like to chase Oakwell Developments?',
		'Remember that we never start a job without a signed order.',
		'Start the demo again from the beginning.'
	],
	[DemoKind.bookkeeping]: [
		'Where is this practice losing money right now?',
		'Which client invoices are overdue, and who do I chase first?',
		'Invoice the year-end accounts for Northfield Plumbing.',
		'Which quotes have gone quiet? Follow up the biggest one.',
		'Are we paying for any software twice? Cancel the spare.',
		'What is waiting in the inbox that needs a reply today?',
		'When does Aire Valley Dental pay, and when must their invoice reach them?',
		'Remember that we never take on a client without a signed engagement letter.',
		'Start the demo again from the beginning.'
	]
};
