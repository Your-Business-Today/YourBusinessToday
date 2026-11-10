import { fail } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { emailDeliveries } from '$lib/data/emailDelivery';
import { taxCalculatorPath } from '$lib/data/taxCalculator/taxCalculatorPath';
import { tooManyEmailsMessage } from '$lib/server/auth/emailSendAllowance';
import { deadlinesEmailsPerInbox, deadlinesEmailsPerVisitor } from '$lib/server/taxDeadlines/deadlinesEmailAllowance';
import { readDeadlinesEmailRequest } from '$lib/server/taxDeadlines/deadlinesEmailRequest';
import { sendTaxDeadlinesEmail } from '$lib/server/taxDeadlines/sendTaxDeadlinesEmail';
import type { Actions } from './$types';

const notSentMessage = 'We could not send the email just now — please try again in a few minutes.';

export const actions: Actions = {
	emailDeadlines: async ({ request, url, getClientAddress }) => {
		const reading = readDeadlinesEmailRequest(await request.formData());
		if ('isHoneypotFilled' in reading) return { isDeadlinesEmailSent: true };
		if ('problem' in reading) return fail(400, { message: reading.problem });
		const { request: deadlinesRequest } = reading;
		const inboxKey = createHash('sha256').update(deadlinesRequest.email).digest('hex');
		const isVisitorAllowed = deadlinesEmailsPerVisitor.isAllowedFrom(getClientAddress());
		if (!isVisitorAllowed) return fail(429, { message: tooManyEmailsMessage });
		const isInboxAllowed = deadlinesEmailsPerInbox.isAllowedFrom(inboxKey);
		if (!isInboxAllowed) return { isDeadlinesEmailSent: true };
		const calculatorUrl = `${url.origin}${taxCalculatorPath}`;
		const delivery = await sendTaxDeadlinesEmail(deadlinesRequest, calculatorUrl, new Date());
		if (delivery !== emailDeliveries.sent) return fail(503, { message: notSentMessage });
		return { isDeadlinesEmailSent: true };
	}
};
