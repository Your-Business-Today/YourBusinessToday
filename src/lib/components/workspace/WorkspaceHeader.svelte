<script lang="ts">
	import { workspaceWidthClasses } from './workspaceStyles';
	import type { Crumb } from './projectCrumbs';
	import type { Snippet } from 'svelte';

	let {
		crumbs,
		title,
		badge,
		actions,
		children
	}: {
		crumbs: Crumb[];
		title: string;
		badge?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<header class="border-b border-hairline bg-carriage/50">
	<div class={`${workspaceWidthClasses} flex flex-col gap-2 py-3 sm:py-4`}>
		{#if crumbs.length > 0}
			<nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-sm text-chalk/50">
				{#each crumbs as crumb (crumb.href)}
					<a href={crumb.href} class="truncate font-display transition hover:text-go">{crumb.label}</a>
					<span aria-hidden="true" class="text-chalk/30">/</span>
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
	</div>
</header>
