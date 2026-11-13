import { billingCoverNames, billingFrequencyNames, billingScheduleLimits } from '$lib/data/books/billingSchedule';
import { textField } from '../actionTypes';
import { invoiceLinesField } from './booksInvoiceFields';

const { longestTitle, latestDayOfMonth, paymentTermsDays } = billingScheduleLimits;

const keepWhatIsThere = '; leave out to keep what the schedule holds';

export const billingScheduleIdField = textField('The billing schedule, by its id as list_billing_schedules gives it');

export const billingCustomerField = textField('The customer the schedule bills, by its id as list_customer_balances gives it');

export const billingScheduleFilterFields = {
	customerId: textField("Leave out for every customer's schedules, or only one customer's by its id as list_customer_balances gives it")
};

/** Each setting of a schedule as the person said it; on a change, each may be left out to keep what the schedule holds. */
function settingFields(suffix: string) {
	return {
		title: textField(`What the schedule bills, at most ${longestTitle} characters, such as Monthly fees; each of a customer's schedules has its own${suffix}`),
		frequency: textField(`How often an invoice is raised: ${billingFrequencyNames.join(', ')}${suffix}`),
		nextInvoiceDate: textField(
			`The day the next invoice is raised, today or later, on day 1 to ${latestDayOfMonth} of the month, written as 2026-12-01${suffix}`
		),
		covers: textField(`${billingCoverNames.join(' or ')}: the period starting on the invoice date, or the one that ended the day before${suffix}`),
		paymentTermsDays: {
			type: ['integer', 'null'],
			description: `Days from each invoice to its due date, ${paymentTermsDays.smallest} to ${paymentTermsDays.largest}, or null for the books' own${suffix}`
		},
		sendsByItself: {
			type: 'boolean',
			description: `true to issue and email each invoice on its day by itself, false to leave each as a draft to issue by hand; only as the person said${suffix}`
		},
		notes: textField(`Notes printed on each invoice, empty text for none${suffix}`),
		isPaused: { type: 'boolean', description: `true pauses the schedule so nothing is raised, false resumes it${suffix}` },
		endsOn: {
			type: ['string', 'null'],
			description: `The last day an invoice may be raised, written as 2027-03-31, or null for no last date${suffix}`
		},
		lines: { ...invoiceLinesField, description: `Every line each invoice carries, in the order they print; at least one${suffix}` }
	};
}

export const newBillingScheduleFields = { customerId: billingCustomerField, ...settingFields('') };

export const billingScheduleChangeFields = { scheduleId: billingScheduleIdField, ...settingFields(keepWhatIsThere) };

export const neededForANewSchedule = ['customerId', 'title', 'frequency', 'nextInvoiceDate', 'covers', 'sendsByItself', 'lines'];
