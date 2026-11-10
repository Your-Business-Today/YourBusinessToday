<script lang="ts">
	import type { Snippet } from 'svelte';

	let { element = $bindable(), children }: { element?: HTMLElement; children: Snippet } = $props();
</script>

<section
	bind:this={element}
	id="take-home"
	aria-label="Your take-home estimate"
	class="relative isolate flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl border border-signal/25
		bg-linear-to-br from-carriage to-night p-6 shadow-2xl shadow-signal/5 sm:p-8 md:sticky md:top-20"
>
	<div class="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full border border-signal/10" aria-hidden="true"></div>
	<div class="pointer-events-none absolute -top-10 -right-10 -z-10 size-44 rounded-full bg-signal/10 blur-3xl" aria-hidden="true"></div>
	<div class="flex items-center justify-between gap-3">
		<p class="font-mono text-xs tracking-[0.2em] text-chalk/70 uppercase">Your take-home estimate</p>
		<span class="flex items-center gap-1.5 rounded-full border border-go/40 px-2.5 py-1 text-xs text-go">
			<span class="size-1.5 animate-pulse rounded-full bg-go" aria-hidden="true"></span>Live
		</span>
	</div>
	{@render children()}
</section>
