<script lang="ts">
	import GoalListPanel from '$lib/components/goals/GoalListPanel.svelte';
	import PanelTabs from '$lib/components/workspace/PanelTabs.svelte';
	import ProjectPeoplePanel from '$lib/components/members/ProjectPeoplePanel.svelte';
	import ProjectPulseStrip from './ProjectPulseStrip.svelte';
	import ProjectStatePanel from './ProjectStatePanel.svelte';
	import TaskTreePanel from './TaskTreePanel.svelte';
	import InternalWorkBoard from './internalWork/InternalWorkBoard.svelte';
	import { currentGoalHorizon, longTermGoalHorizon } from '$lib/data/goalHorizon';
	import { isInternalWork } from '$lib/data/boardSide';
	import { dashboardGridClasses } from '$lib/components/workspace/workspaceStyles';
	import type { GoalSummary } from '$lib/server/goals/summariseGoals';
	import type { Department } from '$lib/data/department';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectPulse } from '$lib/server/projects/summariseProjectPulse';
	import type { ProjectState } from '$lib/server/projects/projectState';
	import type { TaskRowHandlers, TaskRowSources } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
	import type { Todo } from '$lib/server/todos/todoRecord';

	type DashboardSources = TaskRowSources & {
		pulse: ProjectPulse;
		projectState: ProjectState;
		taskTree: TaskTreeNode[];
		goalSummaries: GoalSummary[];
		people: ProjectPerson[];
		isOwner: boolean;
		department: Department;
		todosByTask: Record<string, Todo[]>;
	};

	let {
		projectId,
		sources,
		handlers,
		onAddItem
	}: {
		projectId: string;
		sources: DashboardSources;
		handlers: TaskRowHandlers;
		onAddItem: (department: Department) => void;
	} = $props();

	let selectedPanel = $state('backlog');

	const pulse = $derived(sources.pulse);
	const goalSummaries = $derived(sources.goalSummaries);
	const people = $derived(sources.people);
	const isBuiltWork = $derived(!isInternalWork(sources.department));
	const gridClasses = $derived(isBuiltWork ? dashboardGridClasses : 'grid grid-cols-1 items-start gap-4');
	const asideClasses = $derived(isBuiltWork ? 'flex min-w-0 flex-col gap-4' : 'grid min-w-0 items-start gap-4 lg:grid-cols-2');

	const panelTabs = $derived([
		{ key: 'backlog', label: 'Backlog', count: pulse.openCurrentTaskCount },
		{ key: 'goals', label: 'Goals', count: goalSummaries.length },
		{ key: 'people', label: 'People', count: people.length }
	]);

	function panelVisibility(panelKey: string): string {
		if (panelKey === selectedPanel) return 'flex min-w-0 flex-col gap-4';
		return 'hidden min-w-0 lg:flex lg:flex-col lg:gap-4';
	}
</script>

{#if isBuiltWork}
	<ProjectStatePanel projectState={sources.projectState} {people} {projectId} />
{/if}
<ProjectPulseStrip {pulse} />
<PanelTabs tabs={panelTabs} bind:selectedKey={selectedPanel} />
<div class={gridClasses}>
	<div class={panelVisibility('backlog')}>
		{#if isBuiltWork}
			<TaskTreePanel taskTree={sources.taskTree} {projectId} {sources} {handlers} />
		{:else}
			<InternalWorkBoard taskTree={sources.taskTree} {sources} {handlers} {onAddItem} />
		{/if}
	</div>
	<aside class={asideClasses}>
		<div class={panelVisibility('goals')}>
			<GoalListPanel {goalSummaries} horizon={currentGoalHorizon} department={sources.department} />
			<GoalListPanel {goalSummaries} horizon={longTermGoalHorizon} department={sources.department} />
		</div>
		<div class={panelVisibility('people')}>
			<ProjectPeoplePanel {people} isOwner={sources.isOwner} />
		</div>
	</aside>
</div>
