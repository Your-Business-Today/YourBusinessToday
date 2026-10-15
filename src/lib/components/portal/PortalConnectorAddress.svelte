<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';

	let { address }: { address: string } = $props();
</script>

<DashboardPanel title="Connector address">
	<div class="flex min-w-0 items-center gap-3 px-4 py-4">
		<code class="min-w-0 flex-1 truncate font-mono text-sm text-chalk">{address}</code>
		<CopyTextButton text={address} label="Copy" />
	</div>
</DashboardPanel>
