<script lang="ts">
	import { resultPeriodsFor, type ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';

	let { period = $bindable(), isSelfEmployed }: { period: ResultPeriod; isSelfEmployed: boolean } = $props();
</script>

<div class="inline-flex flex-wrap rounded-2xl border border-chalk/15 bg-night/30 p-1" role="group" aria-label="Show amounts">
	{#each resultPeriodsFor(isSelfEmployed) as option (option.period)}
		<button
			type="button"
			aria-pressed={period === option.period}
			onclick={() => (period = option.period)}
			class="min-h-10 rounded-xl px-3 text-sm sm:px-4 text-chalk/70 transition hover:text-chalk aria-pressed:bg-go
				aria-pressed:font-medium aria-pressed:text-night"
		>
			{option.label}
		</button>
	{/each}
</div>
