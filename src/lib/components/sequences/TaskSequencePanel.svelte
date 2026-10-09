<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import SequenceTrack from './SequenceTrack.svelte';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { TaskSequence } from '$lib/data/taskSequence';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { sequence }: { sequence: TaskSequence<ProjectTask> | null } = $props();

	const placeLabel = $derived(
		sequence === null ? null : `step ${sequence.thisStepNumber} of ${sequence.stepCount}`
	);
</script>

<DashboardPanel title="Sequence" count={placeLabel}>
	{#if sequence === null}
		<p class={panelEmptyClasses}>
			Not in a sequence — edit the task to say which task it waits for, and the steps show here in
			order.
		</p>
	{:else}
		<SequenceTrack {sequence} />
	{/if}
</DashboardPanel>
