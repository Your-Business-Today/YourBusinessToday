<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { inViewWhenPicked } from '$lib/client/inViewWhenPicked';
	import type { BadgeTone } from '$lib/components/site/badgeTones';

	export type Tab = { key: string; label: string; count: number | null; countTone?: BadgeTone; href?: string; isSetApart?: boolean };

	let { tabs, selectedKey = $bindable() }: { tabs: Tab[]; selectedKey: string } = $props();

	const tabClasses =
		'-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 font-display text-sm font-medium whitespace-nowrap transition md:py-2';
	const pickedClasses = 'border-go text-chalk';
	const unpickedClasses = 'border-transparent text-chalk-faint hover:text-chalk';
	const dividerClasses = 'mx-2 my-auto h-4 w-px shrink-0 bg-hairline-strong';
</script>

{#snippet tabContent(tab: Tab)}
	{tab.label}
	{#if tab.count !== null}
		<Badge label={tab.count} tone={tab.countTone} />
	{/if}
{/snippet}

<div role="tablist" class="scrollbar-hidden flex gap-1 overflow-x-auto border-b border-hairline">
	{#each tabs as tab (tab.key)}
		{@const isSelected = tab.key === selectedKey}
		{@const classes = [tabClasses, isSelected ? pickedClasses : unpickedClasses]}
		{#if tab.href === undefined}
			<button type="button" role="tab" aria-selected={isSelected} onclick={() => (selectedKey = tab.key)} use:inViewWhenPicked={isSelected} class={classes}>
				{@render tabContent(tab)}
			</button>
		{:else}
			<a href={tab.href} role="tab" aria-selected={isSelected} aria-current={isSelected ? 'page' : undefined} use:inViewWhenPicked={isSelected} class={classes}>
				{@render tabContent(tab)}
			</a>
		{/if}
		{#if tab.isSetApart}
			<span aria-hidden="true" class={dividerClasses}></span>
		{/if}
	{/each}
</div>
