export type GoalStatus = 'open' | 'met' | 'dropped';

export const goalStatusOrder: GoalStatus[] = ['open', 'met', 'dropped'];

export const openGoalStatus: GoalStatus = 'open';

export const goalStatusLabels: Record<GoalStatus, string> = {
	open: 'Open',
	met: 'Met',
	dropped: 'Dropped'
};

export function parseGoalStatus(value: unknown): GoalStatus {
	const status = goalStatusOrder.find((candidate) => candidate === value);
	if (status === undefined) return 'open';
	return status;
}
