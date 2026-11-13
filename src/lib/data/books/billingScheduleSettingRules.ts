import { validateIsoDate } from './isoDate';
import { billingCoverNames, billingFrequencyNames, billingScheduleLimits, type BillingScheduleSettings } from './billingSchedule';

type SettingName = keyof BillingScheduleSettings;

/** Why the value given for one setting cannot be kept, on the day given, or null when it can. */
type SettingRule = (candidate: unknown, today: string) => string | null;

const dayOfMonthStart = 8;
const { longestTitle, latestDayOfMonth, paymentTermsDays } = billingScheduleLimits;

/** Each setting's rule, as books_billing_schedules holds it (migration 0221): refused by name, never repaired. */
export const billingSettingRules: Record<SettingName, SettingRule> = {
	title: titleRefusal,
	frequency: (candidate) => oneOfRefusal('frequency', candidate, billingFrequencyNames),
	nextInvoiceDate: nextInvoiceDateRefusal,
	covers: (candidate) => oneOfRefusal('covers', candidate, billingCoverNames),
	paymentTermsDays: paymentTermsRefusal,
	sendsByItself: (candidate) => yesOrNoRefusal('sendsByItself', candidate),
	notes: (candidate) => (typeof candidate === 'string' ? null : `notes is text; ${JSON.stringify(candidate)} was given.`),
	isPaused: (candidate) => yesOrNoRefusal('isPaused', candidate),
	endsOn: (candidate) => (candidate === null ? null : validateIsoDate('endsOn', candidate))
};

export const billingSettingNames = Object.keys(billingSettingRules) as SettingName[];

function titleRefusal(candidate: unknown): string | null {
	const isNamed = typeof candidate === 'string' && candidate.trim() !== '';
	if (!isNamed) return 'title names what the schedule bills, such as "Monthly fees".';
	const length = [...candidate].length;
	if (length <= longestTitle) return null;
	return `title is at most ${longestTitle} characters; ${length} were given.`;
}

function nextInvoiceDateRefusal(candidate: unknown, today: string): string | null {
	const dateRefusal = validateIsoDate('nextInvoiceDate', candidate);
	if (dateRefusal !== null) return dateRefusal;
	const day = candidate as string;
	const dayOfMonth = Number(day.slice(dayOfMonthStart));
	if (dayOfMonth > latestDayOfMonth) {
		return `nextInvoiceDate falls on day 1 to ${latestDayOfMonth} of a month, so every month has it; ${day} was given.`;
	}
	if (day >= today) return null;
	const earlierPeriods = 'bring an earlier period in as an ordinary invoice with create_invoice';
	return `nextInvoiceDate ${day} is before today, ${today}. A schedule bills from today on; ${earlierPeriods}.`;
}

function paymentTermsRefusal(candidate: unknown): string | null {
	if (candidate === null) return null;
	const isInRange = Number.isInteger(candidate) && (candidate as number) >= paymentTermsDays.smallest && (candidate as number) <= paymentTermsDays.largest;
	if (isInRange) return null;
	const range = `${paymentTermsDays.smallest} to ${paymentTermsDays.largest}`;
	return `paymentTermsDays is a whole number from ${range}, or null for the books' own; ${JSON.stringify(candidate)} was given.`;
}

function oneOfRefusal(field: string, candidate: unknown, allowed: readonly string[]): string | null {
	if (allowed.includes(candidate as string)) return null;
	return `${field} is one of ${allowed.join(', ')}; ${JSON.stringify(candidate)} was given.`;
}

function yesOrNoRefusal(field: string, candidate: unknown): string | null {
	if (typeof candidate === 'boolean') return null;
	return `${field} is true or false; ${JSON.stringify(candidate)} was given.`;
}
