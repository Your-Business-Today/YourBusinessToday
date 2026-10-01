<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		count = null,
		id = undefined,
		class: panelClasses = '',
		actions,
		toolbar,
		children
	}: {
		title: string;
		count?: number | string | null;
		id?: string;
		class?: string;
		actions?: Snippet;
		toolbar?: Snippet;
		children: Snippet;
	} = $props();
</script>

<section
	{id}
	class={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-carriage ${panelClasses}`}
>
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-2.5">
		<h2 class="flex items-center gap-2 font-display text-xs tracking-widest text-chalk/60 uppercase">
			{title}
			{#if count !== null}
				<span class="rounded-full bg-night px-2 py-0.5 text-[0.7rem] tracking-normal text-chalk/60">
					{count}
				</span>
			{/if}
		</h2>
		{#if actions !== undefined}
			<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
		{/if}
	</div>
	{#if toolbar !== undefined}
		<div class="border-b border-hairline px-4 py-2.5">{@render toolbar()}</div>
	{/if}
	{@render children()}
</section>
