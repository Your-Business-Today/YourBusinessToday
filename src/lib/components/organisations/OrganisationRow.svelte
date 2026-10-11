<script lang="ts">
	import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

	let { organisation, isChild }: { organisation: OrganisationSummary; isChild: boolean } = $props();

	function countLine(organisation: OrganisationSummary): string {
		const projects = `${organisation.projectCount} project${organisation.projectCount === 1 ? '' : 's'}`;
		const people = `${organisation.memberCount} ${organisation.memberCount === 1 ? 'person' : 'people'}`;
		if (organisation.subOrganisationCount === 0) return `${projects} · ${people}`;
		const businesses = `${organisation.subOrganisationCount} sub-organisation${organisation.subOrganisationCount === 1 ? '' : 's'}`;
		return `${businesses} · ${projects} · ${people}`;
	}
</script>

<li class={`flex flex-wrap items-center justify-between gap-4 py-3 pr-5 ${isChild ? 'pl-10' : 'pl-5'}`}>
	<div class="min-w-0">
		<a href={`/organisations/${organisation.id}`} class="font-display transition hover:text-go">
			{#if isChild}<span class="mr-2 text-chalk/30">›</span>{/if}{organisation.name}
		</a>
		<p class="text-xs text-chalk/50">{countLine(organisation)}</p>
	</div>
</li>
