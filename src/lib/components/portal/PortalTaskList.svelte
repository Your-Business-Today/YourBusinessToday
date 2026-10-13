<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalTaskRow from './PortalTaskRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PortalTask } from '$lib/portal/portalProject';

	let { tasks }: { tasks: PortalTask[] } = $props();
</script>

<DashboardPanel title="Open tasks" count={tasks.length}>
	{#if tasks.length === 0}
		<p class={panelEmptyClasses}>Nothing open on this project right now.</p>
	{/if}
	{#if tasks.length > 0}
		<ul class={panelListClasses}>
			{#each tasks as task (task.id)}
				<PortalTaskRow {task} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
