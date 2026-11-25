import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { CostShareMember } from '$lib/data/books/sharing/costShare';
import { CostShareSplitBy } from '$lib/data/books/sharing/costShareUsage';
import { equalWeight } from '$lib/data/books/sharing/costShareWeights';
import { CostShareMembersBy } from '$lib/data/books/sharing/costShareMembersBy';
import { beforeTheHistoryBegan } from '$lib/data/books/sharing/statusSpells';
import type { CostShareMonth } from '$lib/data/books/sharing/costShareSplit';
import type { CostShareReading, CostSharesReading } from '$lib/server/books/costShareReading';

const keptAgainstNoProject = 'kept against no project';

export function describeCostShares(organisationName: string, reading: CostSharesReading): string {
	const heading = `The shared costs of ${organisationName}, with what each project took of each in the twelve months to ${describeMonth(reading.toMonth)}:`;
	const { shares } = reading;
	if (shares.length === 0) return `${heading}\n- No shared costs yet: set_cost_share shares a cost centre's lines among projects.`;
	return [heading, ...shares.flatMap((share) => shareLines(share, reading))].join('\n');
}

function shareLines(share: CostShareReading, reading: CostSharesReading): string[] {
	const { monthsCovered, members, costCentreId, membersBy, splitBy } = share.share;
	const covering = monthsCovered === 1 ? 'each line covers its own month' : `each line covers ${monthsCovered} months from the month it is dated`;
	const isByRule = membersBy === CostShareMembersBy.liveProjects;
	const ruleLine = isByRule ? ['  - shared by every live project, month by month, from its status:'] : [];
	const noMemberLine = isByRule ? '  - no project has been live' : '  - shared by no project yet: add_cost_share_member adds one';
	const memberLines = [...ruleLine, ...(members.length === 0 ? [noMemberLine] : members.map((member) => `  - ${memberText(member, reading)}`))];
	const monthLines = share.months.filter(hasParts).map((month) => `  - ${monthText(month, reading)}`);
	const splitLines = monthLines.length === 0 ? ['  - nothing to split in these months'] : monthLines;
	const splitHeading = splitBy === CostShareSplitBy.usage ? "  Split by each month's usage readings:" : '  Split:';
	return ['', `${share.label} (cost centre ${costCentreId}), ${covering}:`, ...memberLines, splitHeading, ...splitLines];
}

function memberText(member: CostShareMember, reading: CostSharesReading): string {
	const name = memberName(member, reading);
	const until = member.leftMonth === null ? 'and carries on' : `to ${describeMonth(member.leftMonth)}`;
	const from = member.joinedMonth === beforeTheHistoryBegan ? 'from before its status was kept' : `from ${describeMonth(member.joinedMonth)}`;
	const weighted = member.weight === undefined || member.weight === equalWeight ? '' : `, weight ${member.weight}`;
	return `${name} shares it ${from} ${until}${weighted} (member ${member.id})`;
}

function memberName(member: CostShareMember, reading: CostSharesReading): string {
	const { projectId, costCentreId } = member;
	if (costCentreId !== undefined && costCentreId !== null) return `cost centre ${reading.costCentreLabels.get(costCentreId) ?? costCentreId}`;
	return projectId === null ? 'a project since deleted' : (reading.projectNames.get(projectId) ?? projectId);
}

function monthText(month: CostShareMonth, reading: CostSharesReading): string {
	const parts = month.parts.map((part) => {
		const receiver = part.costCentreId === null ? keptAgainstNoProject : (reading.costCentreLabels.get(part.costCentreId) ?? part.costCentreId);
		return `${receiver} ${formatPoundsAndPence(part.amount)}`;
	});
	const equally = month.isSplitEquallyWithoutUsage ? ' (split equally: no usage reading for this month)' : '';
	return `${describeMonth(month.month)}: ${parts.join(', ')}${equally}`;
}

function hasParts(month: CostShareMonth): boolean {
	const { parts } = month;
	return parts.length > 0;
}
