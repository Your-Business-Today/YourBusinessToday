<script lang="ts">
	import { filterChipClasses } from '$lib/components/projects/filterChipClasses';
	import type { ScopeChoice } from '$lib/data/feedScopeChoice';

	let { scope, choices }: { scope: string; choices: ScopeChoice[] } = $props();
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
