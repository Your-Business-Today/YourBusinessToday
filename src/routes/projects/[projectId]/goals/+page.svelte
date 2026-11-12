<script lang="ts">
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import GoalListPanel from '$lib/components/goals/GoalListPanel.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import ProjectStatePanel from '$lib/components/projects/ProjectStatePanel.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import { currentGoalHorizon, longTermGoalHorizon } from '$lib/data/goalHorizon';
	import { departments } from '$lib/data/department';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, projectState, people, goalSummaries } = $derived(data);
</script>

<svelte:head>
	<title>Goals — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.goals} counts={data.developmentTabCounts} />
	<FlashMessage message={form?.message} />
	<ProjectStatePanel {projectState} {people} />
	<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
		<GoalListPanel {goalSummaries} horizon={currentGoalHorizon} department={departments.development} />
		<GoalListPanel {goalSummaries} horizon={longTermGoalHorizon} department={departments.development} />
	</div>
</div>
