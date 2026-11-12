<script lang="ts">
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import { projectNumberClasses } from './projectTableStyles';
	import { shownIdsField } from '$lib/data/shownIds';
	import type { ProjectListRow } from '$lib/client/projectListView.svelte';

	let {
		row,
		shownIds,
		onSetPriority
	}: { row: ProjectListRow; shownIds: string; onSetPriority: () => void } = $props();

	const project = $derived(row.project);
</script>

<div class="flex items-center gap-1">
	<PriorityControls
		moveAction="?/moveProject"
		fieldName="projectId"
		id={project.id}
		isFirst={row.isFirst}
		isLast={row.isLast}
		extraFields={{ [shownIdsField]: shownIds }}
	/>
	<PriorityNumberButton
		label={row.position}
		itemName={project.name}
		class={projectNumberClasses}
		onclick={onSetPriority}
	/>
</div>
