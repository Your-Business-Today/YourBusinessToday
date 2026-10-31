<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import OrganisationBadge from '$lib/components/organisations/OrganisationBadge.svelte';
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import { projectNameClasses, projectNumberClasses, wideScreenOnlyClasses } from './projectTableStyles';
	import { openTaskLine } from '$lib/data/projectTaskTally';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		project,
		isFirst,
		isLast,
		onSetPriority
	}: {
		project: TeamProject;
		isFirst: boolean;
		isLast: boolean;
		onSetPriority: (project: TeamProject) => void;
	} = $props();

	const openTasks = $derived(openTaskLine(project.openTaskCount));
</script>

{#snippet tally()}
	<span class="flex flex-wrap gap-x-2 font-display text-xs text-chalk/50">
		<span>{openTasks}</span>
		<AssignedToYouNote assignedTaskCount={project.assignedTaskCount} />
	</span>
{/snippet}

<div class="flex items-center gap-1">
	<PriorityControls moveAction="?/moveProject" fieldName="projectId" id={project.id} {isFirst} {isLast} />
	<PriorityNumberButton
		label={project.priority}
		itemName={project.name}
		class={projectNumberClasses}
		onclick={() => onSetPriority(project)}
	/>
</div>
<div class="flex min-w-0 flex-col gap-0.5 py-0.5">
	<a href={`/projects/${project.id}`} class={projectNameClasses}>{project.name}</a>
	<p class="truncate text-xs text-chalk/50">Owned by {project.ownerName}</p>
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
<div class="hidden md:block"><ProjectStatusBadge status={project.status} /></div>
<div class="hidden md:block">{@render tally()}</div>
