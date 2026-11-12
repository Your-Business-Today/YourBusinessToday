<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children,
		class: labelClasses = 'gap-2 text-xs text-chalk/60'
	}: { label: string; children: Snippet; class?: string } = $props();
</script>

<label class={['flex items-center', labelClasses]}>
	{label}
	{@render children()}
</label>
