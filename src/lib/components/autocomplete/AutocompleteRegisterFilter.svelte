<script lang="ts">
	import { filterChipClasses } from '$lib/components/projects/filterChipClasses';
	import {
		autocompleteRegisterFilterLabels,
		autocompleteRegisterFilterOrder,
		autocompleteRegisterHref,
		type AutocompleteRegisterFilter
	} from '$lib/data/autocompleteRegisterFilter';

	let { filter }: { filter: AutocompleteRegisterFilter } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each autocompleteRegisterFilterOrder as option (option)}
		<a
			href={autocompleteRegisterHref(option)}
			aria-current={option === filter ? 'page' : undefined}
			class={filterChipClasses(option === filter)}
		>
			{autocompleteRegisterFilterLabels[option]}
		</a>
	{/each}
</div>
