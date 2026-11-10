import { audienceActions } from '../actions/audienceActions';
import { CampaignLimits } from './campaignLimits';
import { toPence } from '$lib/data/books/money';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { validateMoney } from '$lib/data/books/moneyColumn';
import type { CampaignPlan } from './campaign';

export type CampaignPlanCheck = { plan: CampaignPlan } | { problem: string };

const audienceActionKeys = audienceActions.map((action) => action.key);
const { nameCharacters } = CampaignLimits;

/** The campaign as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkCampaignPlan(input: Record<string, unknown>): CampaignPlanCheck {
	const name = typeof input.name === 'string' ? input.name.trim() : '';
	if (name === '') return { problem: 'name is empty: give the campaign a name' };
	if (name.length > nameCharacters) return { problem: `name is ${name.length} characters; keep it to ${nameCharacters}` };
	const objective = typeof input.objective === 'string' ? input.objective.trim() : '';
	if (!audienceActionKeys.includes(objective)) {
		return { problem: `objective is the audience action the campaign pays for, one of ${audienceActionKeys.join(', ')}` };
	}
	const budget = validateMoney('budgetPounds', input.budgetPounds);
	if (typeof budget === 'string') return { problem: asClause(budget) };
	const datesProblem = problemWithDates(input.startsOn, input.endsOn);
	if (datesProblem !== null) return { problem: datesProblem };
	const plan = { name, objective, budgetPence: toPence(budget), startsOn: input.startsOn, endsOn: input.endsOn };
	return { plan: plan as CampaignPlan };
}

function problemWithDates(startsOn: unknown, endsOn: unknown): string | null {
	const problem = validateIsoDate('startsOn', startsOn) ?? validateIsoDate('endsOn', endsOn);
	if (problem !== null) return asClause(problem);
	const isEndingBeforeStart = (endsOn as string) < (startsOn as string);
	if (isEndingBeforeStart) return `endsOn ${endsOn} is before startsOn ${startsOn}; a campaign ends on or after the day it starts`;
	return null;
}

function asClause(refusal: string): string {
	return refusal.replace(/\.$/, '');
}
