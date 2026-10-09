<script lang="ts">
	import { goalHorizonLabels, goalHorizonOrder, type GoalHorizon } from '$lib/data/goalHorizon';

	let { horizon }: { horizon: GoalHorizon } = $props();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<label class="flex flex-col gap-1">
	<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Horizon</span>
	<select name="horizon" value={horizon} class={fieldClasses}>
		{#each goalHorizonOrder as horizonOption (horizonOption)}
			<option value={horizonOption}>{goalHorizonLabels[horizonOption]}</option>
		{/each}
	</select>
	<span class="text-xs text-chalk/50">
		Current goals are where the work is done and the completion counts; long term goals hold
		what is not going to be done yet.
	</span>
</label>
