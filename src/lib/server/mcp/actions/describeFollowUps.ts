import { clientStageLabels } from '$lib/data/clientLifecycle';
import { describeDueDay } from '$lib/data/followUpSentences';
import { formatBritishDate } from '$lib/data/britishDate';
import type { FollowUp, FollowUpCompany } from '$lib/server/people/getFollowUpsDue';

const howToPlanOne = 'update_person gives a person a next step and the day it is due.';
const oneFollowUp = 1;

/** The follow-ups due as the connector gives them: how many and by when, then one line each, the longest overdue first. */
export function describeFollowUpsDue(followUps: FollowUp[], until: string, today: string): string {
	const byWhen = until === today ? 'today' : `by ${formatBritishDate(until)}`;
	if (followUps.length === 0) return `Nobody's next step is due ${byWhen}. ${howToPlanOne}`;
	const heading = followUps.length === oneFollowUp ? `One follow-up is due ${byWhen}:` : `${followUps.length} follow-ups are due ${byWhen}, the longest overdue first:`;
	return [heading, ...followUps.map((followUp) => describeFollowUp(followUp, today))].join('\n');
}

function describeFollowUp(followUp: FollowUp, today: string): string {
	return [
		followUp.name,
		followUp.nextAction,
		describeDueDay(followUp.nextActionDue, today),
		describeCompanies(followUp.companies),
		describeHowToReach(followUp),
		describeLastSpoken(followUp),
		`person ${followUp.id}`
	].join(' — ');
}

function describeCompanies(companies: FollowUpCompany[]): string {
	if (companies.length === 0) return 'no company yet';
	return companies.map((company) => `${company.name} (${clientStageLabels[company.stage]}, client ${company.id})`).join('; ');
}

function describeHowToReach(followUp: FollowUp): string {
	const ways = [followUp.email, followUp.phone].filter((way) => way !== '');
	return ways.length === 0 ? 'no email or phone held' : ways.join(', ');
}

function describeLastSpoken(followUp: FollowUp): string {
	const { lastContactedOn } = followUp;
	return lastContactedOn === null ? 'never spoken to' : `last spoken to ${formatBritishDate(lastContactedOn)}`;
}
