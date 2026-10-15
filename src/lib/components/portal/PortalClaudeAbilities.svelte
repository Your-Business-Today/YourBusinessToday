<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { claudeAbilities } from '$lib/portal/connectingClaude';
</script>

<DashboardPanel title="What your Claude can do here">
	<ul class="flex list-disc flex-col gap-1 py-4 pr-4 pl-9 text-sm text-chalk/80">
		{#each claudeAbilities as ability (ability)}
			<li>{ability}</li>
		{/each}
	</ul>
</DashboardPanel>
