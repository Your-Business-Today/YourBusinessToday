<script lang="ts">
	import { filterChipClasses } from '$lib/components/projects/filterChipClasses';
	import { feedScopes, type FeedScope } from '$lib/data/feedEvent';

	let { scope }: { scope: FeedScope } = $props();

	const choices: { scope: FeedScope; label: string; href: string; title: string }[] = [
		{
			scope: feedScopes.everything,
			label: 'Everything',
			href: '/projects/feed',
			title: 'Every event on every project you are on'
		},
		{
			scope: feedScopes.mine,
			label: 'Tasks I asked for',
			href: '/projects/feed?scope=mine',
			title: 'Only the tasks you raised or that were raised for you'
		}
	];
</script>

<div class="flex flex-wrap gap-2">
	{#each choices as choice (choice.scope)}
		<a
			href={choice.href}
			title={choice.title}
			aria-current={choice.scope === scope ? 'page' : undefined}
			class={filterChipClasses(choice.scope === scope)}
		>
			{choice.label}
		</a>
	{/each}
</div>
