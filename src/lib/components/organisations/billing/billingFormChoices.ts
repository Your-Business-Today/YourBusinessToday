import { BillingCovers, BillingFrequencies, type BillingCover, type BillingFrequency } from '$lib/data/books/billingSchedule';

/** How often a schedule bills, as the form offers it. */
export const billingFrequencyChoices: { value: BillingFrequency; label: string }[] = [
	{ value: BillingFrequencies.monthly, label: 'Every month' },
	{ value: BillingFrequencies.quarterly, label: 'Every quarter' },
	{ value: BillingFrequencies.yearly, label: 'Every year' }
];

/** Which period each invoice covers, as the form offers it. */
export const billingCoverChoices: { value: BillingCover; label: string }[] = [
	{ value: BillingCovers.inAdvance, label: 'In advance: the period starting on its date' },
	{ value: BillingCovers.inArrears, label: 'In arrears: the period that ended the day before' }
];

/** The smallest step a quantity or a price is typed in, a penny, as the money columns hold them. */
export const pennyStep = '0.01';
