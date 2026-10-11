<script lang="ts">
	let { organisationId, organisationName }: { organisationId: string | null; organisationName: string } = $props();
</script>

{#if organisationId !== null && organisationName !== ''}
	<a
		href={`/organisations/${organisationId}`}
		title={`For ${organisationName}`}
		class="relative z-10 max-w-full truncate rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs
			text-chalk/60 transition hover:border-go hover:text-go"
	>
		{organisationName}
	</a>
{/if}
