<script lang="ts">
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import { fieldClasses } from '$lib/components/site/formStyles';

	let {
		priority,
		among,
		name = 'priority'
	}: {
		priority: number;
		among: string;
		name?: string;
	} = $props();
</script>

<SmallCapsField label="Priority">
	<input {name} type="number" min="1" step="1" value={priority} class={`w-24 ${fieldClasses}`} />
	<span class="text-xs text-chalk/50">1 is the top {among}; the others shift to make room.</span>
</SmallCapsField>
