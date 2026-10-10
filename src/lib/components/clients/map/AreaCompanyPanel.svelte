<script lang="ts">
	import ProspectSeedFields from '$lib/components/clients/ProspectSeedFields.svelte';
	import StagePill from '$lib/components/clients/StagePill.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { describeDistance } from '$lib/data/distance';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	let {
		pin,
		addLeadAction,
		addWithDirectorsAction
	}: { pin: AreaPin | null; addLeadAction: string; addWithDirectorsAction: string } = $props();

	const facts = $derived(pin === null ? [] : factsAbout(pin));
	const standing = $derived(pin?.standing ?? null);

	function factsAbout(company: AreaPin): string[] {
		const { sicCodes } = company;
		return [
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
		</div>
		{#if standing !== null}
			<div class="flex flex-wrap items-center gap-3">
				<StagePill stage={standing.stage} />
				<a href={`/clients/${standing.clientId}`} class={quietButtonClasses}>Open the client</a>
			</div>
		{:else}
			<div class="flex flex-wrap gap-2">
				<form method="POST" action={addLeadAction}>
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
