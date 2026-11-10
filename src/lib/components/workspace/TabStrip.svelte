<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';

	export type Tab = { key: string; label: string; count: number | null; href?: string };

	let { tabs, selectedKey = $bindable() }: { tabs: Tab[]; selectedKey: string } = $props();

	const tabClasses =
		'-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 font-display text-sm font-medium whitespace-nowrap transition md:py-2';
	const pickedClasses = 'border-go text-chalk';
	const unpickedClasses = 'border-transparent text-chalk-faint hover:text-chalk';
</script>

{#snippet tabContent(tab: Tab)}
	{tab.label}
	{#if tab.count !== null}
		<Badge label={tab.count} />
	{/if}
{/snippet}

<div role="tablist" class="scrollbar-hidden flex gap-1 overflow-x-auto border-b border-hairline">
	{#each tabs as tab (tab.key)}
		{@const isSelected = tab.key === selectedKey}
		{@const classes = [tabClasses, isSelected ? pickedClasses : unpickedClasses]}
		{#if tab.href === undefined}
			<button type="button" role="tab" aria-selected={isSelected} onclick={() => (selectedKey = tab.key)} class={classes}>
				{@render tabContent(tab)}
			</button>
		{:else}
			<a href={tab.href} role="tab" aria-selected={isSelected} aria-current={isSelected ? 'page' : undefined} class={classes}>
				{@render tabContent(tab)}
			</a>
		{/if}
	{/each}
</div>
