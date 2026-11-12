<script lang="ts">
	import type { Snippet } from 'svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import StagedTaskRow from './StagedTaskRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { DeliveryFact } from '$lib/data/deliveryFacts';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		stagedTasks,
		deliveryFacts,
		actions
	}: { stagedTasks: ProjectTask[]; deliveryFacts: DeliveryFact[]; actions?: Snippet } = $props();

	const hasDeliveryFacts = $derived(deliveryFacts.length > 0);
</script>

{#snippet delivery()}
	<HeaderFacts facts={deliveryFacts} />
{/snippet}

<DashboardPanel
	title="Staged, not live"
	count={stagedTasks.length}
	{actions}
	toolbar={hasDeliveryFacts ? delivery : undefined}
>
	{#if stagedTasks.length === 0}
		<p class={panelEmptyClasses}>
			Nothing is waiting for a deploy: every task merged into staging has been promoted.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each stagedTasks as task (task.id)}
				<StagedTaskRow {task} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
