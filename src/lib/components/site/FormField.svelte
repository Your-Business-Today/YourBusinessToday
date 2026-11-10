<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		hint = '',
		errorMessage = '',
		children,
		class: extraClasses = ''
	}: { label: string; hint?: string; errorMessage?: string; children: Snippet; class?: string } = $props();

	const hasError = $derived(errorMessage !== '');
</script>

<label class={['form-field flex flex-col gap-1', hasError && 'has-error', extraClasses]}>
	<span class="form-field-label text-sm font-medium text-chalk-subtle">{label}</span>
	{@render children()}
	{#if hasError}
		<span class="text-xs font-medium text-signal">{errorMessage}</span>
	{:else if hint !== ''}
		<span class="text-xs font-medium text-chalk-faint">{hint}</span>
	{/if}
</label>

<style>
	.form-field:has(> :global(:is(input, select, textarea)[required])) .form-field-label::after {
		content: ' *';
	}

	.form-field > :global(:is(input:not([type='checkbox'], [type='radio'], [type='file']), select, textarea)) {
		border: 1px solid var(--color-hairline-strong);
		border-radius: calc(var(--spacing) * 1);
		background-color: var(--color-carriage-raised);
		padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
		font-size: var(--text-base);
		line-height: var(--text-base--line-height);
		color: var(--color-chalk);
		outline: none;
	}

	.form-field > :global(:is(input:not([type='checkbox'], [type='radio'], [type='file']), select)) {
		height: calc(var(--spacing) * 11);
		padding-block: 0;
	}

	.form-field > :global(:is(input, select, textarea)::placeholder) {
		color: var(--color-chalk-faint);
	}

	.form-field > :global(:is(input, select, textarea):focus) {
		border-color: var(--color-go);
	}

	.form-field > :global(:is(input, select, textarea):disabled) {
		color: var(--color-chalk-faint);
	}

	.has-error > :global(:is(input, select, textarea)) {
		border-color: var(--color-signal);
	}
</style>
