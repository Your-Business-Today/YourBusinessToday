<script lang="ts">
	import PatchRow from './PatchRow.svelte';
	import type { PatchWithCentre } from '$lib/server/patches/listPatchesWithCentres';

	let { patches }: { patches: PatchWithCentre[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
	{#each patches as patch (patch.id)}
		<PatchRow {patch} />
	{/each}
</ul>
