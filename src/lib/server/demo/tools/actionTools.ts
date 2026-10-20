import {
	cancelSubscription,
	chaseInvoice,
	chaseQuote,
	raiseInvoice,
	remember,
	type DemoChange
} from '$lib/data/demo/demoActions';
import { DemoLimit } from '$lib/data/demo/demoLimits';
import { seedDemoBusiness } from '$lib/data/demo/seed/seedDemoBusiness';
import { noInput, oneField, readString, writes, type DemoTool, type DemoToolOutcome } from './demoTool';

export const actionTools: DemoTool[] = [
	{
		name: 'raise_invoice',
		title: 'Invoice the work done on a job',
		description: 'Raises an invoice for the work done on a job that no invoice covers yet, on 30-day terms.',
		inputSchema: oneField('jobId', 'The job id, such as JOB-0112, from read_business'),
		annotations: writes,
		run: (business, today, input) => outcomeOf(raiseInvoice(business, readString(input, 'jobId'), today))
	},
	{
		name: 'chase_invoice',
		title: 'Chase an unpaid invoice',
		description: 'Sends a reminder for an unpaid invoice from the shared mailbox and records the chase.',
		inputSchema: oneField('invoiceId', 'The invoice id, such as INV-1041, from read_business'),
		annotations: writes,
		run: (business, today, input) => outcomeOf(chaseInvoice(business, readString(input, 'invoiceId'), today))
	},
	{
		name: 'chase_quote',
		title: 'Follow up a quote',
		description: 'Follows up a quote that is waiting on an answer and records the follow-up.',
		inputSchema: oneField('quoteId', 'The quote id, such as QUO-0318, from read_business'),
		annotations: writes,
		run: (business, today, input) => outcomeOf(chaseQuote(business, readString(input, 'quoteId'), today))
	},
	{
		name: 'cancel_subscription',
		title: 'Cancel a subscription',
		description: 'Cancels one subscription, such as the second copy of one paid twice.',
		inputSchema: oneField('subscriptionId', 'The subscription id, such as SUB-04, from read_business'),
		annotations: writes,
		run: (business, today, input) =>
			outcomeOf(cancelSubscription(business, readString(input, 'subscriptionId'), today))
	},
	{
		name: 'remember',
		title: 'Teach the brain',
		description:
			`Adds a note to the business's Your Brain Today brain, up to ${DemoLimit.noteLength} characters, ` +
			'so Claude applies it the next time you ask.',
		inputSchema: oneField('note', 'What the business should remember, in a sentence or two'),
		annotations: writes,
		run: (business, today, input) => outcomeOf(remember(business, readString(input, 'note'), today))
	},
	{
		name: 'reset_demo',
		title: 'Start the demo again',
		description: 'Puts this private copy back to how it started, undoing every change made here.',
		inputSchema: noInput,
		annotations: writes,
		run: (_business, today) => ({
			answer: 'The demo is back to how it started.',
			changed: seedDemoBusiness(today)
		})
	}
];

function outcomeOf(change: DemoChange | string): DemoToolOutcome {
	if (typeof change === 'string') return { answer: change };
	return { answer: change.sentence, changed: change.business };
}
