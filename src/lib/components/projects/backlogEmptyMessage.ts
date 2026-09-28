export type BacklogEmptyReason = {
	assigneeLabel: string | null;
	isWaitingOnMeOnly: boolean;
	hasTasks: boolean;
};

export function backlogEmptyMessage(reason: BacklogEmptyReason): string {
	if (reason.assigneeLabel !== null) return `Nothing open is assigned to ${reason.assigneeLabel}.`;
	if (reason.isWaitingOnMeOnly) return 'Nothing is waiting on you or your Claude.';
	if (reason.hasTasks) return 'Everything here is done — switch the filter to All to see finished tasks.';
	return 'No tasks yet — add one.';
}
