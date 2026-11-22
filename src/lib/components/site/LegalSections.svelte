<script lang="ts">
	import type { LegalSection } from '$lib/data/legalDocument';

	let { sections }: { sections: LegalSection[] } = $props();
</script>

{#each sections as section (section.heading)}
	<h2 class="font-display text-2xl font-medium">{section.heading}</h2>
	{#each section.paragraphs as paragraph (paragraph)}
		<p class="text-chalk/80">{paragraph}</p>
	{/each}
	{#if section.listItems}
		<ul class="flex list-disc flex-col gap-2 pl-6 text-chalk/80">
			{#each section.listItems as listItem (listItem)}
				<li>{listItem}</li>
			{/each}
		</ul>
	{/if}
	{#each section.links ?? [] as link (link.href)}
		<a href={link.href} class="text-chalk underline underline-offset-4 hover:text-signal">
			{link.label}
		</a>
	{/each}
{/each}
