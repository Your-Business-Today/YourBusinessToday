import { shiftMonth, type MonthKey } from '../monthKey';
import { isSharingIn, type CostShareMember } from './costShare';

/** What bringing a shared cost's members in line with the projects using it in a month will change. */
export type MemberSyncPlan = {
	joining: string[];
	leaving: { memberId: string; projectId: string; leftMonth: MonthKey }[];
	removed: { memberId: string; projectId: string }[];
	staying: string[];
	joiningLater: string[];
};

/**
 * The changes that make exactly the projects given share the cost from the month: a project new to it joins that month,
 * one no longer using it shares to the month before, and one added for that very month is taken off. A project already
 * set to join later is left to join when it was set to.
 */
export function planMemberSync(members: CostShareMember[], month: MonthKey, projectIds: string[]): MemberSyncPlan {
	const using = new Set(projectIds);
	const sharingNow = members.filter((member) => member.projectId !== null && isSharingIn(member, month));
	const sharingIds = new Set(sharingNow.map((member) => member.projectId as string));
	const stopping = sharingNow.filter((member) => !using.has(member.projectId as string));
	const laterIds = new Set(members.filter((member) => member.joinedMonth > month).map((member) => member.projectId));
	const newcomers = projectIds.filter((projectId) => !sharingIds.has(projectId));
	return {
		joining: newcomers.filter((projectId) => !laterIds.has(projectId)),
		leaving: stopping.filter((member) => member.joinedMonth < month).map((member) => leavingOf(member, month)),
		removed: stopping.filter((member) => member.joinedMonth === month).map((member) => ({ memberId: member.id, projectId: member.projectId as string })),
		staying: projectIds.filter((projectId) => sharingIds.has(projectId)),
		joiningLater: newcomers.filter((projectId) => laterIds.has(projectId))
	};
}

function leavingOf(member: CostShareMember, month: MonthKey) {
	const monthBefore = -1;
	return { memberId: member.id, projectId: member.projectId as string, leftMonth: shiftMonth(month, monthBefore) };
}
