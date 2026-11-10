import { escapeHtml } from '$lib/data/escapeHtml';
import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';
import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
import type { TaxDeadline } from '$lib/data/taxCalculator/taxDeadlines';
import { estimateFigureLabels, type EstimateFigureName, type EstimateFigures } from '$lib/data/taxCalculator/deadlinesEmailForm';
import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';

export type TaxDeadlinesLetter = {
	rules: TaxYearRules;
	deadlines: TaxDeadline[];
	estimate: EstimateFigures | null;
	calculatorUrl: string;
};

const textStyle = 'margin:0 0 16px;font-size:15px;line-height:1.6;color:#c9d2e6;';
const labelStyle = 'margin:24px 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6c7694;';
const smallPrintStyle = 'margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;';

export function taxDeadlinesSubject(rules: TaxYearRules): string {
	return `Your tax deadlines for ${rules.taxYear}`;
}

export function renderTaxDeadlinesEmail(letter: TaxDeadlinesLetter): string {
	const { rules } = letter;
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">${escapeHtml(taxDeadlinesSubject(rules))}</h1>
		<p style="${textStyle}">
			The dates still ahead for the ${escapeHtml(rules.label)}. The calendar file attached adds each one to
			your calendar with a reminder a week before.
		</p>
		${letter.deadlines.map(deadlineBlock).join('')}
		${letter.estimate === null ? '' : estimateBlock(letter.estimate)}
		${smallPrint(letter)}
	</div>
</div>`;
}

function deadlineBlock(deadline: TaxDeadline): string {
	return `
		<p style="${labelStyle}">${escapeHtml(formatLongDate(deadline.dueOn))}</p>
		<p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#eef1f8;">${escapeHtml(deadline.title)}</p>
		<p style="margin:0;font-size:14px;line-height:1.6;color:#c9d2e6;">
			${escapeHtml(deadline.detail)}
			<a href="${escapeHtml(deadline.sourceUrl)}" style="color:#c9d2e6;">GOV.UK</a>
		</p>`;
}

function estimateBlock(estimate: EstimateFigures): string {
	const figureNames = Object.keys(estimateFigureLabels) as EstimateFigureName[];
	const rows = figureNames
		.filter((figureName) => estimate[figureName] !== null)
		.map((figureName) => estimateRow(estimateFigureLabels[figureName], estimate[figureName] ?? 0));
	return `
		<p style="${labelStyle}">Your estimate, as you asked</p>
		${rows.join('')}`;
}

function estimateRow(label: string, amount: number): string {
	return `<p style="margin:0 0 4px;font-size:15px;color:#c9d2e6;">
			${escapeHtml(label)}: <strong style="color:#eef1f8;">${escapeHtml(formatMoney(amount))}</strong>
		</p>`;
}

function smallPrint(letter: TaxDeadlinesLetter): string {
	const { rules } = letter;
	return `<p style="${smallPrintStyle}">
			Dates checked on GOV.UK on ${escapeHtml(formatLongDate(rules.verifiedOn))}; HMRC can change them, so check
			GOV.UK before you rely on one. You asked for this email on our
			<a href="${escapeHtml(letter.calculatorUrl)}" style="color:#c9d2e6;">tax calculator</a>. We used your address
			to send this one email and have not stored it, so nothing more will follow; Resend, which sends our email,
			keeps its own record of what it sent.
		</p>`;
}
