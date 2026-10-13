<script lang="ts">
	import PairedScreenLink from './PairedScreenLink.svelte';
	import { pairedScreensOf } from '$lib/data/blueprint/pairedScreens';
	import type { McpTool } from '$lib/data/blueprint/mcpMap';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let { tool, siteMap, projectId }: { tool: McpTool; siteMap: SiteMap | null; projectId: string } = $props();

	const { stories, routes } = $derived(tool);
	const pairedScreens = $derived(pairedScreensOf(routes, siteMap));
	const headingClasses = 'font-display text-xs tracking-widest text-chalk/50 uppercase';
</script>

<div class="flex min-w-0 flex-col gap-3">
	<section class="flex flex-col gap-1.5">
		<h3 class={headingClasses}>The same thing for a person</h3>
		<ul class="flex flex-wrap gap-1.5">
			{#each pairedScreens as screen (screen.route)}
				<li><PairedScreenLink {screen} {projectId} /></li>
			{:else}
				<li class="text-xs text-caution">No screen does this for a person: a parity gap.</li>
			{/each}
		</ul>
	</section>
	<section class="flex flex-col gap-1.5">
		<h3 class={headingClasses}>Stories it serves</h3>
		<ul class="flex flex-col gap-1 text-chalk/80">
			{#each stories as story (story.id)}
				<li><span class="font-mono text-xs text-chalk/50">{story.id}</span> {story.story}</li>
			{/each}
		</ul>
	</section>
</div>
