<script lang="ts">
	import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

	let { organisation }: { organisation: OrganisationSummary } = $props();

	function countLine(organisation: OrganisationSummary): string {
		const projects = `${organisation.projectCount} project${organisation.projectCount === 1 ? '' : 's'}`;
		const people = `${organisation.memberCount} ${organisation.memberCount === 1 ? 'person' : 'people'}`;
		return `${projects} · ${people}`;
	}
</script>

<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
	<div class="min-w-0">
		<a href={`/organisations/${organisation.id}`} class="font-display transition hover:text-go">{organisation.name}</a>
		<p class="text-xs text-chalk/50">{countLine(organisation)}</p>
	</div>
</li>
