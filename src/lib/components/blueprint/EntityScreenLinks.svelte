<script lang="ts">
	import { siteMapScreenHref } from './blueprintViews';
	import type { Screen } from '$lib/data/blueprint/siteMap';

	let { screens, projectId }: { screens: Screen[]; projectId: string } = $props();

	const linkClasses =
		'rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-chalk/70 hover:border-go hover:text-go';
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Screens</h3>
	<ul class="flex flex-wrap gap-1.5">
		{#each screens as screen (screen.route)}
			<li><a href={siteMapScreenHref(projectId, screen.route)} class={linkClasses}>{screen.route}</a></li>
		{/each}
	</ul>
</section>
