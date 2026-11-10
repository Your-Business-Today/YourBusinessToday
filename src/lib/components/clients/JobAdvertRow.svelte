<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { JobAdvert } from '$lib/data/jobAdvertRules';

	let { advert }: { advert: JobAdvert } = $props();

	const isRoleWeServe = $derived(advert.matchedRole !== null);
	const posted = $derived(advert.postedOn === '' ? 'Date not shown' : `Posted ${formatBritishDate(advert.postedOn)}`);
</script>

<li class="flex flex-col text-sm">
	<a href={advert.url} target="_blank" rel="noreferrer" class="hover:text-signal">{advert.title}</a>
	<span class="text-xs text-chalk/50">
		{posted} · found {formatBritishDate(advert.foundAt)}
		{#if isRoleWeServe}
			· <span class="text-go">{advert.matchedRole} — a role we replace or amplify</span>
		{/if}
	</span>
</li>
