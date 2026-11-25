import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { CostShareMember } from '$lib/data/books/sharing/costShare';
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
	const { monthsCovered, members, costCentreId } = share.share;
	const covering = monthsCovered === 1 ? 'each line covers its own month' : `each line covers ${monthsCovered} months from the month it is dated`;
	const memberLines =
		members.length === 0 ? ['  - shared by no project yet: add_cost_share_member adds one'] : members.map((member) => `  - ${memberText(member, reading)}`);
	const monthLines = share.months.filter(hasParts).map((month) => `  - ${monthText(month, reading)}`);
	const splitLines = monthLines.length === 0 ? ['  - nothing to split in these months'] : monthLines;
	return ['', `${share.label} (cost centre ${costCentreId}), ${covering}:`, ...memberLines, '  Split:', ...splitLines];
}

function memberText(member: CostShareMember, reading: CostSharesReading): string {
	const name = member.projectId === null ? 'a project since deleted' : (reading.projectNames.get(member.projectId) ?? member.projectId);
	const until = member.leftMonth === null ? 'and carries on' : `to ${describeMonth(member.leftMonth)}`;
	return `${name} shares it from ${describeMonth(member.joinedMonth)} ${until} (member ${member.id})`;
}

function monthText(month: CostShareMonth, reading: CostSharesReading): string {
	const parts = month.parts.map((part) => {
		const receiver = part.costCentreId === null ? keptAgainstNoProject : (reading.costCentreLabels.get(part.costCentreId) ?? part.costCentreId);
		return `${receiver} ${formatPoundsAndPence(part.amount)}`;
	});
	return `${describeMonth(month.month)}: ${parts.join(', ')}`;
}

function hasParts(month: CostShareMonth): boolean {
	const { parts } = month;
	return parts.length > 0;
}
