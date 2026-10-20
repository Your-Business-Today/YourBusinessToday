<script lang="ts">
	import DemoLinkedSystemRow from './DemoLinkedSystemRow.svelte';
	import type { DemoLinkedSystem } from '$lib/data/demo/demoBusiness';

	let { systems }: { systems: DemoLinkedSystem[] } = $props();
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Everything linked</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium">
			What the business runs on, and what Claude reaches through each.
		</h2>
		<div class="mt-8 border-t border-hairline">
			{#each systems as system (system.name)}
				<DemoLinkedSystemRow {system} />
			{/each}
		</div>
	</div>
</section>
