<script lang="ts">
	import { complexityCountLimits } from '$lib/data/taskComplexity';
	import { inputClasses } from '$lib/components/site/formStyles';

	let { name, label, value }: { name: string; label: string; value: number | undefined } = $props();
</script>

<label class="flex flex-col gap-1 text-xs text-chalk/60">
	{label}
	<input
		type="number"
		{name}
		required
		min={complexityCountLimits.least}
		max={complexityCountLimits.most}
		step="1"
		value={value ?? ''}
		class={`${inputClasses} text-sm`}
	/>
</label>
