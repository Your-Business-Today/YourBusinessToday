<script lang="ts">
	import { workspaceWidthClasses } from './workspaceStyles';
	import type { Crumb } from './projectCrumbs';
	import type { Snippet } from 'svelte';

	let {
		crumbs,
		title,
		badge,
		actions,
		tabs,
		children
	}: {
		crumbs: Crumb[];
		title: string;
		badge?: Snippet;
		actions?: Snippet;
		tabs?: Snippet;
		children?: Snippet;
	} = $props();

	const footClasses = $derived(tabs === undefined ? 'pb-3 sm:pb-4' : '');
</script>

<header class="border-b border-hairline bg-carriage/50">
	<div class={`${workspaceWidthClasses} flex flex-col gap-2 pt-3 sm:pt-4 ${footClasses}`}>
		{#if crumbs.length > 0}
			<nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-sm text-chalk-faint">
				{#each crumbs as crumb (crumb.href)}
					<a href={crumb.href} class="truncate font-display transition hover:text-chalk">{crumb.label}</a>
					<span aria-hidden="true" class="text-hairline-strong">/</span>
				{/each}
			</nav>
		{/if}
		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
			<div class="flex min-w-0 items-center gap-2.5">
				<h1 class="min-w-0 font-display text-xl leading-tight font-medium break-words sm:text-2xl">
					{title}
				</h1>
				{@render badge?.()}
			</div>
			{#if actions !== undefined}
				<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
			{/if}
		</div>
		{@render children?.()}
		{#if tabs !== undefined}
			<div class="-mx-3 -mb-px pt-1">{@render tabs()}</div>
		{/if}
	</div>
</header>
