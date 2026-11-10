<script lang="ts">
	import ContextChangeList from './ContextChangeList.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { hasChanges } from '$lib/data/companyContext/contextChanges';
	import type { ContextChanges } from '$lib/data/companyContext/contextChanges';

	let { changes, onSelect }: { changes: ContextChanges; onSelect: (partKey: string) => void } = $props();

	const title = $derived(`Changed since version ${changes.sinceVersion}`);
	const removedNames = $derived(changes.removed.map((part) => part.name).join(', '));
</script>

<DashboardPanel {title}>
	<div class="flex flex-col gap-4 px-4 py-4 text-sm">
		{#if hasChanges(changes)}
			<ContextChangeList heading="New" parts={changes.added} {onSelect} />
			<ContextChangeList heading="Put differently" parts={changes.changed} {onSelect} />
			{#if removedNames !== ''}
				<p class="text-chalk/70">Taken out: {removedNames}.</p>
			{/if}
		{:else}
			<p class="text-chalk/50">Nothing about the parts changed: every review was kept.</p>
		{/if}
	</div>
</DashboardPanel>
