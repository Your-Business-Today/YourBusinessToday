<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { defaultRadiusMiles, radiusOrder } from '$lib/data/mapRadii';
	import { inputClasses, panelClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { AreaSearch } from '$lib/data/areaSearch';

	let { search }: { search: AreaSearch | null } = $props();
</script>

<form method="GET" class={panelClasses}>
	<div class="grid gap-3 sm:grid-cols-[10rem_9rem_1fr_auto] sm:items-end">
		<FormField label="Postcode">
			<input
				name="postcode"
				required
				value={search?.postcode ?? ''}
				placeholder="GU1 3AA"
				autocapitalize="characters"
				class={inputClasses}
			/>
		</FormField>
		<FormField label="Radius">
			<select name="radiusMiles" value={search?.radiusMiles ?? defaultRadiusMiles} class={selectClasses}>
				{#each radiusOrder as miles (miles)}
					<option value={miles}>{miles} mile{miles === 1 ? '' : 's'}</option>
				{/each}
			</select>
		</FormField>
		<FormField label="SIC codes (optional)">
			<input
				name="sicCodes"
				value={search?.sicCodes.join(', ') ?? ''}
				placeholder="41100, 43390"
				class={inputClasses}
			/>
		</FormField>
		<SubmitButton savingLabel="Mapping…">Map the area</SubmitButton>
	</div>
	<p class="text-xs text-chalk/50">
		Every active company registered within the radius, and everyone already on our register there.
	</p>
</form>
