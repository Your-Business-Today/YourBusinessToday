import { deadlineCalendar } from '$lib/data/taxCalculator/deadlineCalendar';
import { deadlinesStillAhead, taxDeadlinesFor } from '$lib/data/taxCalculator/taxDeadlines';
import { rulesFor } from '$lib/data/taxCalculator/taxYearRules';
import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
import { renderTaxDeadlinesEmail, taxDeadlinesSubject } from '$lib/server/email/taxDeadlinesEmail';
import { sendTransactionalEmail, type EmailDelivery } from '$lib/server/email/sendTransactionalEmail';
import type { DeadlinesEmailRequest } from './deadlinesEmailRequest';

/** Sends the deadlines once, with a calendar file, and keeps nothing: the address is used here and dropped. */
export async function sendTaxDeadlinesEmail(
	request: DeadlinesEmailRequest,
	calculatorUrl: string,
	now: Date
): Promise<EmailDelivery> {
	const rules = rulesFor(request.taxYear);
	const deadlines = deadlinesStillAhead(taxDeadlinesFor(rules), now);
	const calendarName = `Tax deadlines ${rules.taxYear}`;
	return sendTransactionalEmail({
		to: request.email,
		subject: taxDeadlinesSubject(rules),
		html: renderTaxDeadlinesEmail({ rules, deadlines, estimate: request.estimate, calculatorUrl }),
		attachments: [
			{
				filename: calendarFileNameFor(rules),
				content: Buffer.from(deadlineCalendar(deadlines, calendarName, now)).toString('base64')
			}
		]
	});
}

function calendarFileNameFor(rules: TaxYearRules): string {
	return `tax-deadlines-${rules.taxYear.replace('/', '-')}.ics`;
}
