<script lang="ts">
	import ProspectSeedFields from '$lib/components/clients/ProspectSeedFields.svelte';
	import RegisterStandingLink from '$lib/components/clients/RegisterStandingLink.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { describeDistance } from '$lib/data/distance';
	import { describeFiledFigures, type FiledFigures } from '$lib/data/filedFigures';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { isHub } from '$lib/data/registerRules';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	let {
		pin,
		figures = null,
		addLeadAction,
		addWithDirectorsAction,
		patchId = ''
	}: { pin: AreaPin | null; figures?: FiledFigures | null; addLeadAction: string; addWithDirectorsAction: string; patchId?: string } = $props();

	const facts = $derived(pin === null ? [] : factsAbout(pin));
	const standing = $derived(pin?.standing ?? null);
	const canBecomeLead = $derived(pin !== null && !isHub(pin) && pin.companyNumber !== '');

	function factsAbout(company: AreaPin): string[] {
		const { sicCodes } = company;
		return [
			isHub(company) ? `${company.companyCount} companies registered at this address` : '',
			company.statusNote,
			company.isNonTrading ? 'Dormant, or no accounts filed' : '',
			company.companyNumber === '' ? '' : `Company ${company.companyNumber}`,
			company.incorporatedOn === '' ? '' : `Incorporated ${formatBritishDate(company.incorporatedOn)}`,
			sicCodes.length === 0 ? '' : `SIC ${sicCodes.join(', ')}`,
			`${describeDistance(company.distanceMiles)} from the centre`
		].filter((fact) => fact !== '');
	}
</script>

{#if pin === null}
	<aside
		class="flex items-center justify-center rounded-2xl border-2 border-dashed border-hairline p-8
			text-center text-sm text-chalk/60"
	>
		<p>Choose a pin or a row to see the company and add it as a lead.</p>
	</aside>
{:else}
	<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-xl font-medium">{pin.name}</h2>
			<p class="text-sm text-chalk/70">{pin.address}</p>
			<ul class="text-xs text-chalk/50">
				{#each facts as fact (fact)}
					<li>{fact}</li>
				{/each}
			</ul>
			{#if figures !== null}
				<a href={figures.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/70 hover:text-signal">{describeFiledFigures(figures)}</a>
			{/if}
		</div>
		{#if standing !== null}
			<RegisterStandingLink {standing} />
		{:else if canBecomeLead}
			<div class="flex flex-wrap gap-2">
				<form method="POST" action={addLeadAction}>
					<input type="hidden" name="patchId" value={patchId} />
					<ProspectSeedFields company={pin} />
					<SubmitButton class={quietButtonClasses} savingLabel="Adding…">Add as lead</SubmitButton>
				</form>
				<form method="POST" action={addWithDirectorsAction}>
					<ProspectSeedFields company={pin} />
					<SubmitButton class={confirmButtonClasses} savingLabel="Adding…">Add with directors</SubmitButton>
				</form>
			</div>
		{/if}
	</aside>
{/if}
