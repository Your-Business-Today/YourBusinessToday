<script lang="ts">
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	let {
		priority,
		among,
		name = 'priority'
	}: {
		priority: number;
		among: string;
		name?: string;
	} = $props();

	const fieldClasses =
		'w-24 rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<SmallCapsField label="Priority">
	<input {name} type="number" min="1" step="1" value={priority} class={fieldClasses} />
	<span class="text-xs text-chalk/50">1 is the top {among}; the others shift to make room.</span>
</SmallCapsField>
