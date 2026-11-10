<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { KitEntry } from '$lib/brand/projections/brandKitPage';

	let { entry }: { entry: KitEntry } = $props();

	const decidedOn = $derived(entry.decidedOn === '' ? '' : formatBritishDate(entry.decidedOn));
	const setting = $derived([entry.source, decidedOn].filter((part) => part !== '').join(', '));
</script>

{#if entry.reason !== ''}
	<p class="text-sm text-chalk-muted">{entry.reason}</p>
{/if}
{#if setting !== ''}
	<p class="text-xs text-chalk-subtle">{setting}</p>
{/if}
