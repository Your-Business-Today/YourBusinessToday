<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from '$lib/components/site/Badge.svelte';
	import BrandSpinner from '$lib/components/site/BrandSpinner.svelte';

	let {
		title = '',
		count = null,
		id = undefined,
		class: panelClasses = '',
		isPadded = false,
		scrollHeightClass = '',
		isLoading = false,
		errorMessage = '',
		actions,
		toolbar,
		children
	}: {
		title?: string;
		count?: number | string | null;
		id?: string;
		class?: string;
		isPadded?: boolean;
		scrollHeightClass?: string;
		isLoading?: boolean;
		errorMessage?: string;
		actions?: Snippet;
		toolbar?: Snippet;
		children: Snippet;
	} = $props();

	const bodyClasses = $derived(
		['flex min-w-0 flex-col', isPadded ? 'p-6' : '', scrollHeightClass === '' ? '' : `overflow-auto ${scrollHeightClass}`].join(' ')
	);
</script>

<section {id} class={`flex min-w-0 flex-col overflow-hidden border border-hairline bg-carriage ${panelClasses}`}>
	{#if title !== ''}
		<div class="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-6 py-4">
			<div class="flex min-w-0 items-center gap-2">
				<h2 class="font-display text-lg font-semibold text-chalk">{title}</h2>
				{#if count !== null}
					<Badge label={count} />
				{/if}
			</div>
			{#if actions !== undefined}
				<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
			{/if}
		</div>
	{/if}
	{#if toolbar !== undefined}
		<div class="border-b border-hairline px-6 py-3">{@render toolbar()}</div>
	{/if}
	{#if errorMessage !== ''}
		<p role="alert" class="border-b border-hairline px-6 py-3 text-sm text-signal">{errorMessage}</p>
	{/if}
	<div class={bodyClasses}>
		{#if isLoading}
			<div class="flex justify-center p-6"><BrandSpinner size={32} /></div>
		{:else}
			{@render children()}
		{/if}
	</div>
</section>
