<script lang="ts">
	import NeuronConnectionList from './NeuronConnectionList.svelte';
	import NeuronPageGlance from './NeuronPageGlance.svelte';
	import { neuronKindLabel } from './neuronKinds';
	import type { NeuronConnection } from './neuronConnections';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		page,
		context,
		pageHref,
		glanceHref,
		connections,
		onOpenConnection,
		onClose
	}: {
		page: BrainPageSummary;
		context: BrainContext | undefined;
		pageHref: string;
		glanceHref: string;
		connections: NeuronConnection[];
		onOpenConnection: (slug: string) => void;
		onClose: () => void;
	} = $props();

	const kindLabel = $derived(neuronKindLabel(page.kind));
	const kindLine = $derived(context === undefined ? kindLabel : `${kindLabel} · ${context.name}`);
</script>

<aside
	data-covers-brain
	class="absolute inset-y-0 right-0 z-20 flex w-full max-w-lg flex-col border-l border-hairline
		bg-night/90 backdrop-blur-md"
>
	<header class="flex items-start gap-3 border-b border-hairline p-4 lg:p-5">
		<button
			type="button"
			onclick={onClose}
			aria-label="Close the page"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline
				font-display text-sm text-chalk/70 transition hover:border-chalk/40 hover:text-chalk"
		>
			✕
		</button>
		<div class="flex min-w-0 flex-col gap-1">
			<p class="font-display text-xs tracking-widest text-signal uppercase">{kindLine}</p>
			<h3 class="font-display text-xl font-medium text-chalk">{page.title}</h3>
			<p class="text-sm text-chalk-muted">{page.summary}</p>
		</div>
	</header>
	<div class="flex-1 overflow-y-auto">
		<NeuronPageGlance {glanceHref} />
		<NeuronConnectionList {connections} onOpen={onOpenConnection} />
	</div>
	<footer class="border-t border-hairline p-4">
		<a href={pageHref} class="font-display text-sm text-chalk/80 underline transition hover:text-chalk">
			Open the full page →
		</a>
	</footer>
</aside>
