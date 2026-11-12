<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import {
		organisationProjectFilterLabel,
		organisationProjectFilterOrder,
		type OrganisationProjectFilter
	} from '$lib/data/organisationProjectFilter';

	let { selectedFilter = $bindable() }: { selectedFilter: OrganisationProjectFilter } = $props();
</script>

<FormField label="Show" class="w-full sm:max-w-56">
	<select bind:value={selectedFilter}>
		{#each organisationProjectFilterOrder as filter (filter)}
			<option value={filter}>{organisationProjectFilterLabel(filter)}</option>
		{/each}
	</select>
</FormField>
