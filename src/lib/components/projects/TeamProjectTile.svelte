<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ProjectTileFrame from './ProjectTileFrame.svelte';
	import ProjectTileHeading from './ProjectTileHeading.svelte';
	import ProjectTilePriority from './ProjectTilePriority.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		project,
		listReorder,
		isFirst,
		isLast,
		onSetPriority
	}: {
		project: TeamProject;
		listReorder: ListReorder;
		isFirst: boolean;
		isLast: boolean;
		onSetPriority: (project: TeamProject) => void;
	} = $props();

	const openTaskLine = $derived(
		project.openTaskCount === 1 ? '1 open task' : `${project.openTaskCount} open tasks`
	);
</script>

<ProjectTileFrame {listReorder} projectId={project.id} projectName={project.name}>
	{#snippet content(dragHandle)}
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<ProjectTilePriority
					priority={project.priority}
					projectName={project.name}
					onSetPriority={() => onSetPriority(project)}
				/>
				<span class="font-display text-xs tracking-widest text-chalk/40 uppercase">Team</span>
			</div>
			<ProjectStatusBadge status={project.status} />
		</div>
		<ProjectTileHeading projectName={project.name}>
			<p class="text-sm text-chalk/60">Owned by {project.ownerName}</p>
		</ProjectTileHeading>
		<div class="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
			<span class="font-display text-xs text-chalk/50">{openTaskLine}</span>
			<AssignedToYouNote assignedTaskCount={project.assignedTaskCount} />
		</div>
		<div class="relative flex items-center gap-1 border-t border-hairline pt-3">
			{@render dragHandle()}
			<PriorityControls
				moveAction="?/moveProject"
				fieldName="projectId"
				id={project.id}
				{isFirst}
				{isLast}
			/>
		</div>
	{/snippet}
</ProjectTileFrame>
