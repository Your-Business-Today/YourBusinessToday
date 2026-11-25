<script lang="ts">
	import type { LegalSection } from '$lib/data/legalDocument';
	import { legalSectionClasses, type LegalSectionSize } from './legalSectionSizes';

	let { sections, size = 'article' }: { sections: LegalSection[]; size?: LegalSectionSize } =
		$props();

	const classes = $derived(legalSectionClasses[size]);
</script>

{#each sections as section (section.heading)}
	<h2 class={classes.heading}>{section.heading}</h2>
	{#each section.paragraphs as paragraph (paragraph)}
		<p class={classes.paragraph}>{paragraph}</p>
	{/each}
	{#if section.listItems}
		<ul class={classes.list}>
			{#each section.listItems as listItem (listItem)}
				<li>{listItem}</li>
			{/each}
		</ul>
	{/if}
	{#each section.links ?? [] as link (link.href)}
		<a href={link.href} class={classes.link}>
			{link.label}
		</a>
	{/each}
{/each}
