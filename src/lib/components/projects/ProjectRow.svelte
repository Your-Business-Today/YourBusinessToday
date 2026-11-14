<script lang="ts">
	import CompletionBar from './CompletionBar.svelte';
	import KitVersionBadge from './KitVersionBadge.svelte';
	import ProjectNameLink from './ProjectNameLink.svelte';
	import ProjectOrganisationCell from './ProjectOrganisationCell.svelte';
	import ProjectOwnerCell from './ProjectOwnerCell.svelte';
	import ProjectPriorityCell from './ProjectPriorityCell.svelte';
	import ProjectActionsMenu from './ProjectActionsMenu.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ProjectTaskTally from './ProjectTaskTally.svelte';
	import { wideScreenOnlyClasses } from './projectTableStyles';
	import type { ProjectListRow } from '$lib/client/projectListView.svelte';
	import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

	let {
		row,
		latestKitVersion,
		shownIds,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		row: ProjectListRow;
		latestKitVersion: string;
		shownIds: string;
		onEdit: (project: ListedProject) => void;
		onDelete: (project: ListedProject) => void;
		onSetPriority: (project: ListedProject) => void;
	} = $props();

	const project = $derived(row.project);
</script>

{#snippet tally()}
	<ProjectTaskTally
		openTaskCount={project.openTaskCount}
		taskCount={project.taskCount}
		assignedTaskCount={project.assignedTaskCount}
	/>
{/snippet}

<ProjectPriorityCell {row} {shownIds} onSetPriority={() => onSetPriority(project)} />
<div class="flex min-w-0 flex-col gap-0.5 py-0.5">
	<ProjectNameLink {project} />
	{#if project.description !== ''}
		<p class="hidden truncate text-xs text-chalk/50 md:block">{project.description}</p>
	{/if}
	{#if !project.isYours}
		<p class="truncate text-xs text-chalk/50 md:hidden">Owned by {project.ownerName}</p>
	{/if}
	<span class="flex flex-wrap items-center gap-x-2 gap-y-1 md:hidden">
		<ProjectStatusBadge status={project.status} />
		{@render tally()}
	</span>
</div>
<ProjectOwnerCell {project} />
<ProjectOrganisationCell
	organisationId={project.organisationId}
	organisationName={project.organisationName}
/>
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
	{#if project.isYours}
		<ProjectActionsMenu
			projectName={project.name}
			onEdit={() => onEdit(project)}
			onDelete={() => onDelete(project)}
		/>
	{/if}
</div>
