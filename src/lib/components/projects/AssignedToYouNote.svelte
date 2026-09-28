<script lang="ts">
	import { assignedToYouLine } from '$lib/data/assignedTaskLine';

	let { assignedTaskCount }: { assignedTaskCount: number } = $props();

	const line = $derived(assignedToYouLine(assignedTaskCount));
</script>

{#if line !== ''}
	<span class="font-display text-xs text-go">{line}</span>
{/if}
