<script lang="ts">
	import DocumentSectionList from './DocumentSectionList.svelte';
	import DocumentShelfEmpty from './DocumentShelfEmpty.svelte';
	import { documentSectionsOf } from '$lib/projectDocuments/documentSections';
	import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

	let { documents, projectName }: { documents: ProjectDocument[]; projectName: string } = $props();

	const sections = $derived(documentSectionsOf(documents));
</script>

{#if sections.length === 0}
	<DocumentShelfEmpty {projectName} />
{:else}
	<div class="flex flex-col gap-8">
		{#each sections as section (section.name)}
			<DocumentSectionList {section} />
		{/each}
	</div>
{/if}
