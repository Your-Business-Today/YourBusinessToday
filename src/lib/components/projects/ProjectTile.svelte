<script lang="ts">
	import KitVersionBadge from './KitVersionBadge.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import ProjectActionsMenu from './ProjectActionsMenu.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ProjectTileFrame from './ProjectTileFrame.svelte';
	import ProjectTileHeading from './ProjectTileHeading.svelte';
	import ProjectTilePriority from './ProjectTilePriority.svelte';
	import ProjectTileProgress from './ProjectTileProgress.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

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

<ProjectTileFrame {listReorder} projectId={project.id} projectName={project.name}>
	{#snippet content(dragHandle)}
		<div class="flex items-center justify-between gap-3">
			<ProjectTilePriority
				priority={project.priority}
				projectName={project.name}
				onSetPriority={() => onSetPriority(project)}
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
		<ProjectTileHeading projectName={project.name}>
			{#if project.description !== ''}
				<p class="line-clamp-2 text-sm text-chalk/60">{project.description}</p>
			{/if}
		</ProjectTileHeading>
		<ProjectTileProgress
			openTaskCount={project.openTaskCount}
			taskCount={project.taskCount}
			completionPercent={project.completionPercent}
			assignedTaskCount={project.assignedTaskCount}
			longTermGoalCount={project.longTermGoalCount}
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
</ProjectTileFrame>
