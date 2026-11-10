<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormField from './FormField.svelte';

	let { label, children, class: extraClasses = '' }: { label: string; children: Snippet; class?: string } =
		$props();
</script>

<FormField {label} class={extraClasses}>{@render children()}</FormField>
