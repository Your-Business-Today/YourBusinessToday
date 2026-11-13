<script lang="ts">
	import JourneyLegendSample from './JourneyLegendSample.svelte';
	import { journeyLegendItems } from './journeyLegend';
	import { journeyLegendWords } from './journeySiteMapWords';
	import { journeySiteMapHref } from './journeySiteMapAddress';

	let { projectId, roles, chosenRole }: { projectId: string; roles: string[]; chosenRole: string } = $props();

	const roleLinkClasses = 'rounded-full border px-3 py-0.5 transition';
</script>

<div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
	<nav aria-label="Whose journeys the map draws" class="flex flex-wrap items-center gap-2 text-sm">
		<span class="text-chalk-subtle">{journeyLegendWords.roles}</span>
		{#each roles as role (role)}
			{@const isChosen = role === chosenRole}
			<a
				href={journeySiteMapHref(projectId, { role })}
				aria-current={isChosen ? 'page' : undefined}
				data-sveltekit-noscroll
				class={[roleLinkClasses, isChosen ? 'border-go text-go' : 'border-hairline text-chalk-muted hover:text-go']}
			>
				{role}
			</a>
		{/each}
	</nav>
	<ul aria-label="What the marks mean" class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-chalk-muted">
		{#each journeyLegendItems as item (item.mark)}
			<li class="flex items-center gap-2">
				<JourneyLegendSample mark={item.mark} />
				{item.words}
			</li>
		{/each}
	</ul>
</div>
