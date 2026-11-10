<script lang="ts">
	import { taxYearNames } from '$lib/data/taxCalculator/taxYearRules';
	import type { TaxYearName } from '$lib/data/taxCalculator/taxRuleTypes';

	let { taxYear = $bindable() }: { taxYear: TaxYearName } = $props();
</script>

<label class="flex items-center gap-3 text-sm text-chalk/65">
	Tax year
	<select bind:value={taxYear} class="min-h-11 rounded-2xl border border-hairline bg-carriage px-4 font-medium text-chalk outline-none focus:border-go">
		{#each taxYearNames as name (name)}
			<option value={name}>{name.replace('/', ' / ')}</option>
		{/each}
	</select>
</label>
