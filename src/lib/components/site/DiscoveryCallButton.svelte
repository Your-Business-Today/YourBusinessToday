<script lang="ts">
	import LineIcon from './LineIcon.svelte';
	import { discoveryCallLabel, discoveryCallPath } from '$lib/data/discoveryCall';

	let {
		label = discoveryCallLabel,
		isSolid = false,
		hasCalendarIcon = false,
		class: extraClasses = ''
	}: { label?: string; isSolid?: boolean; hasCalendarIcon?: boolean; class?: string } = $props();

	const outlineClasses = 'border border-signal text-signal hover:bg-signal hover:text-night';
	const solidClasses = 'bg-signal text-night hover:brightness-110';
</script>

<a
	href={discoveryCallPath}
	class={[
		'inline-flex items-center gap-3 rounded-xl px-6 py-3 font-display font-medium transition',
		isSolid ? solidClasses : outlineClasses,
		extraClasses
	]}
>
	{#if hasCalendarIcon}
		<LineIcon kind="calendar" class="h-6 w-6 shrink-0" />
	{/if}
	{label}
	<LineIcon kind="arrow" class="h-5 w-5 shrink-0" />
</a>
