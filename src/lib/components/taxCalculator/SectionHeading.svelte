<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		stepNumber,
		eyebrow,
		heading,
		id,
		aside
	}: { stepNumber: number; eyebrow: string; heading?: string; id?: string; aside?: Snippet } = $props();
</script>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col gap-3">
		<p class="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-chalk/60 uppercase">
			<span class="grid size-7 place-items-center rounded-full border border-hairline text-signal">
				0{stepNumber}
			</span>
			{eyebrow}
		</p>
		{#if heading}
			<h2 {id} class="font-display text-2xl font-medium sm:text-3xl">{heading}</h2>
		{/if}
	</div>
	{#if aside}{@render aside()}{/if}
</div>
