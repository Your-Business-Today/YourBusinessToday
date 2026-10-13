<script lang="ts">
	let { environmentUrl }: { environmentUrl: string } = $props();
</script>

{#if environmentUrl !== ''}
	<a
		href={environmentUrl}
		target="_blank"
		rel="noopener"
		class="truncate text-xs text-chalk/60 transition hover:text-go"
	>
		Open your system ↗
	</a>
{/if}
