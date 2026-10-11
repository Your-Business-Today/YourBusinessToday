<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { goalHorizonLabels, goalHorizonOrder, type GoalHorizon } from '$lib/data/goalHorizon';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { horizon }: { horizon: GoalHorizon } = $props();
</script>

<SmallCapsField label="Horizon">
	<select name="horizon" value={horizon} class={fieldClasses}>
		{#each goalHorizonOrder as horizonOption (horizonOption)}
			<option value={horizonOption}>{goalHorizonLabels[horizonOption]}</option>
		{/each}
	</select>
	<span class="text-xs text-chalk/50">
		Current goals are where the work is done and the completion counts; long term goals hold
		what is not going to be done yet.
	</span>
</SmallCapsField>
