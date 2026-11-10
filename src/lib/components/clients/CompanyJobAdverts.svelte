<script lang="ts">
	import FindJobAdvertsButton from './FindJobAdvertsButton.svelte';
	import JobAdvertRow from './JobAdvertRow.svelte';
	import type { CompanyToSearchForAdverts } from '$lib/data/jobAdvertRequest';
	import type { JobAdvert } from '$lib/data/jobAdvertRules';

	let { company, adverts }: { company: CompanyToSearchForAdverts; adverts: JobAdvert[] } = $props();
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h3 class="font-display text-sm text-chalk/70">Job adverts</h3>
		<FindJobAdvertsButton {company} />
	</div>
	{#if adverts.length === 0}
		<p class="text-xs text-chalk/50">None kept yet.</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each adverts as advert (advert.url)}
				<JobAdvertRow {advert} />
			{/each}
		</ul>
	{/if}
</div>
