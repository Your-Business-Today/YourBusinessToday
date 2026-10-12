<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { defaultRadiusMiles, radiusOrder } from '$lib/data/mapRadii';
	import { inputClasses, panelClasses, selectClasses } from '$lib/components/site/formStyles';
	import { longestPatchName } from '$lib/data/patchRules';

	let { suggestedPostcode }: { suggestedPostcode: string } = $props();
</script>

<form method="POST" action="?/createPatch" id="new-patch" class={panelClasses}>
	<h2 class="font-display text-lg">New patch</h2>
	<div class="grid gap-3 sm:grid-cols-[1fr_10rem_9rem_1fr_auto] sm:items-end">
		<FormField label="Name">
			<input name="name" required maxlength={longestPatchName} placeholder="Kingston" class={inputClasses} />
		</FormField>
		<FormField label="Centre postcode">
			<input
				name="centrePostcode"
				required
				value={suggestedPostcode}
				placeholder="KT1 1EU"
				autocapitalize="characters"
				class={inputClasses}
			/>
		</FormField>
		<FormField label="Radius">
			<select name="radiusMiles" value={defaultRadiusMiles} class={selectClasses}>
				{#each radiusOrder as miles (miles)}
					<option value={miles}>{miles} mile{miles === 1 ? '' : 's'}</option>
				{/each}
			</select>
		</FormField>
		<FormField label="SIC codes (optional)">
			<input name="sicCodes" placeholder="41100, 43390" class={inputClasses} />
		</FormField>
		<SubmitButton savingLabel="Saving…">Save the patch</SubmitButton>
	</div>
	<p class="text-xs text-chalk/50">
		The outcodes within the radius are laid out when the patch is saved; the map draws every company registered in them.
	</p>
</form>
