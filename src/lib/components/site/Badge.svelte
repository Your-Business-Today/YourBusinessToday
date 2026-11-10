<script lang="ts">
	import { badgeToneClasses, type BadgeTone } from './badgeTones';

	let {
		label,
		tone = 'neutral',
		hasDot = false,
		onOpen
	}: { label: string | number; tone?: BadgeTone; hasDot?: boolean; onOpen?: () => void } = $props();

	const shapeClasses =
		'inline-flex items-center gap-1 rounded px-2 py-0.5 font-display text-xs font-medium whitespace-nowrap';
</script>

{#snippet content()}
	{#if hasDot}
		<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
	{/if}
	{label}
{/snippet}

{#if onOpen === undefined}
	<span class={`${shapeClasses} ${badgeToneClasses[tone]}`}>{@render content()}</span>
{:else}
	<button type="button" onclick={onOpen} class={`${shapeClasses} ${badgeToneClasses[tone]} transition hover:text-chalk`}>
		{@render content()}
		<span aria-hidden="true">›</span>
	</button>
{/if}
