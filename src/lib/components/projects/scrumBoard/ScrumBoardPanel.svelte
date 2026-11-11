<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ScrumColumnSection from './ScrumColumnSection.svelte';
	import VelocityStrip from './VelocityStrip.svelte';
	import type { ScrumBoard } from '$lib/data/scrumBoard';

	let { board }: { board: ScrumBoard } = $props();

	const cardCount = $derived(board.columns.reduce((count, column) => count + column.cardCount, 0));
</script>

<DashboardPanel title="Board" count={cardCount}>
	{#snippet toolbar()}
		<VelocityStrip velocity={board.velocity} />
	{/snippet}
	<div class="grid gap-3 p-4 sm:grid-cols-2 md:p-6 lg:grid-cols-3 2xl:grid-cols-6">
		{#each board.columns as column (column.stage)}
			<ScrumColumnSection {column} />
		{/each}
	</div>
</DashboardPanel>
