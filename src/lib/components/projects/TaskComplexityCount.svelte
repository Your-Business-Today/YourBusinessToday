<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { complexityCountLimits } from '$lib/data/taskComplexity';
	import { inputClasses } from '$lib/components/site/formStyles';

	let { name, label, value }: { name: string; label: string; value: number | undefined } = $props();
</script>

<FormField {label}>
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
</FormField>
