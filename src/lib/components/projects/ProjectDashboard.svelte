<script lang="ts">
	import GoalListPanel from '$lib/components/goals/GoalListPanel.svelte';
	import PanelTabs from '$lib/components/workspace/PanelTabs.svelte';
	import ProjectPeoplePanel from '$lib/components/members/ProjectPeoplePanel.svelte';
	import ProjectPulseStrip from './ProjectPulseStrip.svelte';
	import TaskTreePanel from './TaskTreePanel.svelte';
	import { dashboardGridClasses } from '$lib/components/workspace/workspaceStyles';
	import type { GoalSummary } from '$lib/server/goals/getGoalSummaries';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectPulse } from '$lib/server/projects/summariseProjectPulse';
	import type { TaskRowHandlers, TaskRowSources } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	type DashboardSources = TaskRowSources & {
		pulse: ProjectPulse;
		taskTree: TaskTreeNode[];
		goalSummaries: GoalSummary[];
		people: ProjectPerson[];
		isOwner: boolean;
	};

	let {
		projectId,
		sources,
		handlers
	}: { projectId: string; sources: DashboardSources; handlers: TaskRowHandlers } = $props();

	let selectedPanel = $state('backlog');

	const pulse = $derived(sources.pulse);
	const goalSummaries = $derived(sources.goalSummaries);
	const people = $derived(sources.people);

	const panelTabs = $derived([
		{ key: 'backlog', label: 'Backlog', count: pulse.openTaskCount },
		{ key: 'goals', label: 'Goals', count: goalSummaries.length },
		{ key: 'people', label: 'People', count: people.length }
	]);

	function panelVisibility(panelKey: string): string {
		if (panelKey === selectedPanel) return 'flex min-w-0 flex-col gap-4';
		return 'hidden min-w-0 lg:flex lg:flex-col lg:gap-4';
	}
</script>

<ProjectPulseStrip {pulse} />
<PanelTabs tabs={panelTabs} bind:selectedKey={selectedPanel} />
<div class={dashboardGridClasses}>
	<div class={panelVisibility('backlog')}>
		<TaskTreePanel taskTree={sources.taskTree} {projectId} {sources} {handlers} />
	</div>
	<aside class="flex min-w-0 flex-col gap-4">
		<div class={panelVisibility('goals')}>
			<GoalListPanel {goalSummaries} />
		</div>
		<div class={panelVisibility('people')}>
			<ProjectPeoplePanel {people} isOwner={sources.isOwner} />
		</div>
	</aside>
</div>
