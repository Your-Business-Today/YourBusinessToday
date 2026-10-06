<script lang="ts">
	import KitVersionBadge from './KitVersionBadge.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ProjectActionsMenu from './ProjectActionsMenu.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ProjectTileProgress from './ProjectTileProgress.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import { projectTileClasses, projectTilePriorityClasses } from './projectTileStyles';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectList';

	let {
		project,
		latestKitVersion,
		listReorder,
		isFirst,
		isLast,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		project: ProjectSummary;
		latestKitVersion: string;
		listReorder: ListReorder;
		isFirst: boolean;
		isLast: boolean;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
	} = $props();
</script>

<ReorderableRow {listReorder} rowId={project.id} class={projectTileClasses}>
	{#snippet children(dragHandle)}
		<a href={`/projects/${project.id}`} class="absolute inset-0 rounded-xl">
			<span class="sr-only">Open {project.name}</span>
		</a>
		<div class="flex items-center justify-between gap-3">
			<PriorityNumberButton
				label={project.priority}
				itemName={project.name}
				class={`relative ${projectTilePriorityClasses}`}
				onclick={() => onSetPriority(project)}
			/>
			<div class="flex flex-wrap items-center justify-end gap-1.5">
				<KitVersionBadge
					repositoryUrl={project.repositoryUrl}
					kitVersion={project.kitVersion}
					kitVersionReadAt={project.kitVersionReadAt}
					{latestKitVersion}
				/>
				<ProjectStatusBadge status={project.status} />
			</div>
		</div>
		<div class="flex flex-col gap-1">
			<h3 class="font-display text-base leading-snug font-medium transition group-hover/tile:text-go">
				{project.name}
			</h3>
			{#if project.description !== ''}
				<p class="line-clamp-2 text-sm text-chalk/60">{project.description}</p>
			{/if}
		</div>
		<ProjectTileProgress
			openTaskCount={project.openTaskCount}
			taskCount={project.taskCount}
			completionPercent={project.completionPercent}
			assignedTaskCount={project.assignedTaskCount}
		/>
		<div class="relative flex items-center justify-between gap-2 border-t border-hairline pt-2">
			<div class="flex items-center gap-1">
				{@render dragHandle()}
				<PriorityControls
					moveAction="?/moveProject"
					fieldName="projectId"
					id={project.id}
					{isFirst}
					{isLast}
				/>
			</div>
			<ProjectActionsMenu
				projectName={project.name}
				onEdit={() => onEdit(project)}
				onDelete={() => onDelete(project)}
			/>
		</div>
	{/snippet}
</ReorderableRow>
