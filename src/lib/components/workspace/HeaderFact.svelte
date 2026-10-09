<script lang="ts">
	let { fact }: { fact: { label: string; href?: string } } = $props();
</script>

<li class="min-w-0 truncate">
	{#if fact.href === undefined}
		{fact.label}
	{:else}
		<a href={fact.href} target="_blank" rel="noopener" class="transition hover:text-go">
			{fact.label} ↗
		</a>
	{/if}
</li>
