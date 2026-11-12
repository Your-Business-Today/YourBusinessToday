<script lang="ts">
	import type { DetailField, OrganisationDetailValues } from '$lib/data/organisationDetailGroups';

	let { fields, details }: { fields: readonly DetailField[]; details: OrganisationDetailValues } = $props();
</script>

<dl class="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-[12rem_1fr] sm:gap-y-4">
	{#each fields as field (field.key)}
		{@const value = details[field.key]}
		<dt title={field.meaning} class="font-medium text-chalk-subtle">{field.label}</dt>
		{#if value === ''}
			<dd class="pb-3 text-chalk-faint sm:pb-0">Not set</dd>
		{:else}
			<dd class="min-w-0 pb-3 break-words whitespace-pre-line text-chalk sm:pb-0">{value}</dd>
		{/if}
	{/each}
</dl>
