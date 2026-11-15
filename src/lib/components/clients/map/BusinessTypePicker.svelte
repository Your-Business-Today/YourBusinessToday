<script lang="ts">
	import { businessTypes, describeChosenTypes } from '$lib/data/businessTypes';
	import { selectClasses } from '$lib/components/site/formStyles';

	let { chosenKeys }: { chosenKeys: string[] } = $props();

	let picked = $state<string[]>([]);
	$effect.pre(() => {
		picked = [...chosenKeys];
	});

	const closedLabel = $derived(describeChosenTypes(picked));
</script>

<details class="relative">
	<summary class={`${selectClasses} cursor-pointer list-none truncate`}>{closedLabel}</summary>
	<div
		class="absolute z-20 mt-2 flex max-h-80 w-full flex-col sm:w-80 gap-2 overflow-y-auto rounded-xl border border-hairline
			bg-night p-4 shadow-lg"
	>
		{#each businessTypes as type (type.key)}
			<label class="flex items-start gap-3 text-sm">
				<input type="checkbox" name="businessType" value={type.key} bind:group={picked} class="mt-0.5 accent-go" />
				{type.name}
			</label>
		{/each}
	</div>
</details>
