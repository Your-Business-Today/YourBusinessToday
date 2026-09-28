<script lang="ts">
	import { renderProse } from '$lib/data/prose/renderProse';

	let { text, class: textClasses = '' }: { text: string; class?: string } = $props();

	const html = $derived(renderProse(text));
</script>

<div class={`prose-text flex flex-col gap-2 ${textClasses}`}>
	{@html html}
</div>

<style>
	.prose-text :global(:where(ul, ol)) {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding-left: 1.5rem;
	}
	.prose-text :global(ul) {
		list-style: disc;
	}
	.prose-text :global(ol) {
		list-style: decimal;
	}
	.prose-text :global(li::marker) {
		color: var(--color-go);
		font-family: var(--font-display);
	}
	.prose-text :global(:where(h1, h2, h3, h4)) {
		font-family: var(--font-display);
		font-weight: 500;
		color: var(--color-chalk);
		margin-top: 0.5rem;
	}
	.prose-text :global(strong) {
		color: var(--color-chalk);
		font-weight: 600;
	}
	.prose-text :global(a) {
		color: var(--color-go);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.prose-text :global(code) {
		border-radius: 0.375rem;
		background-color: var(--color-night);
		padding: 0.1rem 0.35rem;
		font-size: 0.85em;
	}
	.prose-text :global(pre) {
		overflow-x: auto;
		border-radius: 0.75rem;
		background-color: var(--color-night);
		padding: 0.75rem 1rem;
	}
	.prose-text :global(blockquote) {
		border-left: 2px solid var(--color-hairline);
		padding-left: 0.75rem;
		color: color-mix(in srgb, var(--color-chalk) 70%, transparent);
	}
	.prose-text :global(table) {
		border-collapse: collapse;
		font-size: 0.875em;
	}
	.prose-text :global(:where(th, td)) {
		border: 1px solid var(--color-hairline);
		padding: 0.25rem 0.5rem;
		text-align: left;
	}
</style>
