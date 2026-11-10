import { isEmailShaped } from '$lib/data/emailShape';
import { deadlinesEmailFields, deadlinesEmailLimits, type EstimateFigures } from '$lib/data/taxCalculator/deadlinesEmailForm';
import { taxYearNames } from '$lib/data/taxCalculator/taxYearRules';
import type { TaxYearName } from '$lib/data/taxCalculator/taxRuleTypes';
import { readEstimateFigures } from './estimateFiguresReading';

export type DeadlinesEmailRequest = {
	email: string;
	taxYear: TaxYearName;
	estimate: EstimateFigures | null;
};

export type DeadlinesEmailReading =
	| { request: DeadlinesEmailRequest }
	| { isHoneypotFilled: true }
	| { problem: string };

export function readDeadlinesEmailRequest(formData: FormData): DeadlinesEmailReading {
	if (fieldValue(formData, deadlinesEmailFields.honeypot) !== '') return { isHoneypotFilled: true };
	const email = fieldValue(formData, deadlinesEmailFields.email).toLowerCase();
	const emailProblem = problemWithEmail(email);
	if (emailProblem !== null) return { problem: emailProblem };
	const taxYear = taxYearNamed(fieldValue(formData, deadlinesEmailFields.taxYear));
	if (taxYear === null) return { problem: 'Choose a tax year the calculator covers.' };
	const estimateReading = readEstimateFigures((fieldName) => fieldValue(formData, fieldName));
	if ('problem' in estimateReading) return { problem: estimateReading.problem };
	return { request: { email, taxYear, estimate: estimateReading.estimate } };
}

function fieldValue(formData: FormData, fieldName: string): string {
	return String(formData.get(fieldName) ?? '').trim();
}

function problemWithEmail(email: string): string | null {
	if (email.length > deadlinesEmailLimits.longestEmail) {
		return `Keep the email address under ${deadlinesEmailLimits.longestEmail} characters.`;
	}
	if (!isEmailShaped(email)) return 'Enter an email address to send the deadlines to.';
	return null;
}

function taxYearNamed(text: string): TaxYearName | null {
	const taxYear = taxYearNames.find((name) => name === text);
	return taxYear ?? null;
}
