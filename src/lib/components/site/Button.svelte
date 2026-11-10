<script lang="ts">
	import type { Snippet } from 'svelte';
	import { classesForButton } from './buttonClasses';
	import type { ButtonLook, ButtonSize } from './buttonLooks';

	let {
		look = 'secondary',
		size = 'small',
		type = 'button',
		href,
		label,
		isDestructive = false,
		isIconOnly = false,
		isSaving = false,
		savingLabel = 'Saving…',
		disabled = false,
		onclick,
		children
	}: {
		look?: ButtonLook;
		size?: ButtonSize;
		type?: 'button' | 'submit';
		href?: string;
		label?: string;
		isDestructive?: boolean;
		isIconOnly?: boolean;
		isSaving?: boolean;
		savingLabel?: string;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const classes = $derived(classesForButton({ look, size, isDestructive, isIconOnly }));
</script>

{#if href === undefined}
	<button {type} {onclick} disabled={isSaving || disabled} aria-busy={isSaving} aria-label={label} class={classes}>
		{#if isSaving}
			<span
				class="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
				aria-hidden="true"
			></span>
			{savingLabel}
		{:else}
			{@render children()}
		{/if}
	</button>
{:else}
	<a {href} {onclick} aria-label={label} class={classes}>{@render children()}</a>
{/if}
