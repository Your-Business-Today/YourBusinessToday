<script lang="ts">
	import BrainConstellation from '$lib/components/brain/BrainConstellation.svelte';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainDrawing } from '$lib/data/businessBrainDrawing';

	let { drawing, addresses }: { drawing: BusinessBrainDrawing; addresses: BusinessBrainAddresses } = $props();

	const { contexts, pageIndex, pageLinks } = $derived(drawing);
</script>

<div class="h-[70vh] min-h-[26rem]">
	<BrainConstellation pageHref={addresses.page} glanceHref={addresses.pageGlance} {contexts} {pageIndex} {pageLinks} />
</div>
