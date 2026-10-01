<script lang="ts">
	type Fact = { label: string; href?: string };

	let { facts }: { facts: Fact[] } = $props();
</script>

{#if facts.length > 0}
	<ul class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chalk/60">
		{#each facts as fact (fact.label)}
			<li class="min-w-0 truncate">
				{#if fact.href === undefined}
					{fact.label}
				{:else}
					<a href={fact.href} target="_blank" rel="noopener" class="transition hover:text-go">
						{fact.label} ↗
					</a>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
