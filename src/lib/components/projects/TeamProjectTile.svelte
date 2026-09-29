<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import { projectTileClasses, projectTilePriorityClasses } from './projectTileStyles';
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

<ReorderableRow {listReorder} rowId={project.id} class={projectTileClasses}>
	{#snippet children(dragHandle)}
		<a href={`/projects/${project.id}`} class="absolute inset-0 rounded-2xl">
			<span class="sr-only">Open {project.name}</span>
		</a>
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<PriorityNumberButton
					label={project.priority}
					itemName={project.name}
					class={`relative ${projectTilePriorityClasses}`}
					onclick={() => onSetPriority(project)}
				/>
				<span class="font-display text-xs tracking-widest text-chalk/40 uppercase">Team</span>
			</div>
			<ProjectStatusBadge status={project.status} />
		</div>
		<div class="flex flex-col gap-1">
			<h3 class="font-display text-lg leading-snug font-medium transition group-hover/tile:text-go">
				{project.name}
			</h3>
			<p class="text-sm text-chalk/60">Owned by {project.ownerName}</p>
		</div>
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
</ReorderableRow>
