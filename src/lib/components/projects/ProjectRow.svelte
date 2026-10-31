<script lang="ts">
	import CompletionBar from './CompletionBar.svelte';
	import KitVersionBadge from './KitVersionBadge.svelte';
	import OrganisationBadge from '$lib/components/organisations/OrganisationBadge.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ProjectActionsMenu from './ProjectActionsMenu.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ProjectTaskTally from './ProjectTaskTally.svelte';
	import { projectNameClasses, projectNumberClasses, wideScreenOnlyClasses } from './projectTableStyles';
	import { shownIdsField } from '$lib/data/shownIds';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	let {
		project,
		latestKitVersion,
		position,
		shownIds,
		isFirst,
		isLast,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		project: ProjectSummary;
		latestKitVersion: string;
		position: number;
		shownIds: string;
		isFirst: boolean;
		isLast: boolean;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
	} = $props();
</script>

{#snippet tally()}
	<ProjectTaskTally
		openTaskCount={project.openTaskCount}
		taskCount={project.taskCount}
		assignedTaskCount={project.assignedTaskCount}
		longTermGoalCount={project.longTermGoalCount}
	/>
{/snippet}

<div class="flex items-center gap-1">
	<PriorityControls
		moveAction="?/moveProject"
		fieldName="projectId"
		id={project.id}
		{isFirst}
		{isLast}
		extraFields={{ [shownIdsField]: shownIds }}
	/>
	<PriorityNumberButton
		label={position}
		itemName={project.name}
		class={projectNumberClasses}
		onclick={() => onSetPriority(project)}
	/>
</div>
<div class="flex min-w-0 flex-col gap-0.5 py-0.5">
	<a href={`/projects/${project.id}`} class={projectNameClasses}>{project.name}</a>
	{#if project.description !== ''}
		<p class="hidden truncate text-xs text-chalk/50 md:block">{project.description}</p>
	{/if}
	<span class="flex flex-wrap items-center gap-x-2 gap-y-1 md:hidden">
		<ProjectStatusBadge status={project.status} />
		{@render tally()}
	</span>
</div>
<div class={wideScreenOnlyClasses}>
	<OrganisationBadge
		organisationId={project.organisationId}
		organisationName={project.organisationName}
		isTeamProject={project.isTeamProject}
	/>
</div>
<div class={wideScreenOnlyClasses}>
	<KitVersionBadge
		repositoryUrl={project.repositoryUrl}
		kitVersion={project.kitVersion}
		kitVersionReadAt={project.kitVersionReadAt}
		{latestKitVersion}
	/>
</div>
<div class="hidden md:block"><ProjectStatusBadge status={project.status} /></div>
<div class="hidden flex-col gap-1 md:flex">
	{@render tally()}
	{#if project.taskCount > 0}
		<CompletionBar completionPercent={project.completionPercent} />
	{/if}
</div>
<div class="flex justify-end">
	<ProjectActionsMenu
		projectName={project.name}
		onEdit={() => onEdit(project)}
		onDelete={() => onDelete(project)}
	/>
</div>
