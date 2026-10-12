<script lang="ts">
	import RegisterStandingLink from '$lib/components/clients/RegisterStandingLink.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { sightingSourceLabels } from '$lib/data/sightingRules';
	import type { RegisterStanding } from '$lib/server/clients/area/areaPin';
	import type { Sighting } from '$lib/server/sightings/sightingRecord';

	let { sighting, seenByName, standing }: { sighting: Sighting; seenByName: string; standing: RegisterStanding | null } = $props();
</script>

<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl font-medium">{sighting.businessName}</h2>
		<p class="text-sm text-chalk/70">{sighting.address === '' ? sighting.sector : `${sighting.address} · ${sighting.sector}`}</p>
		<p class="text-sm text-chalk/80">{sighting.whatWasSeen}</p>
		<a href={sighting.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/50 hover:text-signal">
			Seen on {sightingSourceLabels[sighting.sourceKind]} by {seenByName}, {formatBritishDate(sighting.seenAt)}
		</a>
		{#if sighting.companyNumber !== ''}
			<p class="text-xs text-chalk/50">Company {sighting.companyNumber}</p>
		{/if}
	</div>
	{#if standing !== null}
		<RegisterStandingLink {standing} />
	{:else}
		<form method="POST" action="?/addSightingAsLead">
			<input type="hidden" name="sightingId" value={sighting.id} />
			<SubmitButton class={confirmButtonClasses} savingLabel="Adding…">Add as lead</SubmitButton>
		</form>
	{/if}
	<form method="POST" action="?/matchSighting" class="flex items-end gap-2">
		<input type="hidden" name="sightingId" value={sighting.id} />
		<input name="companyNumber" required placeholder="Company number on the register" aria-label="Company number" class={inputClasses} />
		<SubmitButton class={quietButtonClasses} savingLabel="Matching…">Match</SubmitButton>
	</form>
</aside>
