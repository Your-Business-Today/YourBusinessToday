<script lang="ts">
	import GoalListPanel from '$lib/components/goals/GoalListPanel.svelte';
	import PanelTabs from '$lib/components/workspace/PanelTabs.svelte';
	import ProjectPeoplePanel from '$lib/components/members/ProjectPeoplePanel.svelte';
	import ProjectPulseStrip from './ProjectPulseStrip.svelte';
	import InternalWorkBoard from './internalWork/InternalWorkBoard.svelte';
	import { currentGoalHorizon, longTermGoalHorizon } from '$lib/data/goalHorizon';
	import type { GoalSummary } from '$lib/server/goals/summariseGoals';
	import type { Department } from '$lib/data/department';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectPulse } from '$lib/server/projects/summariseProjectPulse';
	import type { TaskRowHandlers, TaskRowSources } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
	import type { Todo } from '$lib/server/todos/todoRecord';

	type DashboardSources = TaskRowSources & {
		pulse: ProjectPulse;
		taskTree: TaskTreeNode[];
		goalSummaries: GoalSummary[];
		people: ProjectPerson[];
		isOwner: boolean;
		department: Department;
		todosByTask: Record<string, Todo[]>;
	};

	let {
		sources,
		handlers,
		onAddItem
	}: {
		sources: DashboardSources;
		handlers: TaskRowHandlers;
		onAddItem: (department: Department) => void;
	} = $props();

	let selectedPanel = $state('backlog');

	const pulse = $derived(sources.pulse);
	const goalSummaries = $derived(sources.goalSummaries);
	const people = $derived(sources.people);

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

<ProjectPulseStrip {pulse} />
<PanelTabs tabs={panelTabs} bind:selectedKey={selectedPanel} />
<div class="grid grid-cols-1 items-start gap-4">
	<div class={panelVisibility('backlog')}>
		<InternalWorkBoard taskTree={sources.taskTree} {sources} {handlers} {onAddItem} />
	</div>
	<aside class="grid min-w-0 items-start gap-4 lg:grid-cols-2">
		<div class={panelVisibility('goals')}>
			<GoalListPanel {goalSummaries} horizon={currentGoalHorizon} department={sources.department} />
			<GoalListPanel {goalSummaries} horizon={longTermGoalHorizon} department={sources.department} />
		</div>
		<div class={panelVisibility('people')}>
			<ProjectPeoplePanel {people} isOwner={sources.isOwner} />
		</div>
	</aside>
</div>
