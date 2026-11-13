import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { ProjectStatus } from '$lib/data/projectStatus';

/** A project as its client sees it on the portal: what YBT is doing for them, in their words. */
export type PortalProject = {
	id: string;
	name: string;
	clientId: string | null;
	status: ProjectStatus;
	environmentUrl: string;
	completionPercent: number;
	currentGoals: PortalGoal[];
	openTasks: PortalTask[];
};

/** Where a goal came from: the confirmed workflow map it was raised from, if any. */
export type PortalGoalOrigin = {
	workflowMap: { stage: MapStage; versionNumber: number } | null;
};

export type PortalGoal = PortalGoalOrigin & {
	id: string;
	title: string;
	measure: string;
	completionPercent: number;
	openTaskCount: number;
};

export type PortalTask = {
	id: string;
	title: string;
	statusLabel: string;
	goalTitle: string;
};
