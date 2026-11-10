<script lang="ts">
	import ContextConfirmForm from './ContextConfirmForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { portalHomePath } from '$lib/portal/portalPaths';
	import {
		canConfirm,
		confirmationHeldBack,
		confirmedSentence,
		notConfirmedYet,
		staffNextStep,
		whatHappensNext
	} from '$lib/data/companyContext/contextConfirmation';
	import type { ContextConfirmation } from '$lib/data/companyContext/contextConfirmation';
	import type { ReviewTally } from '$lib/data/companyContext/reviewTally';

	let {
		tally,
		versionNumber,
		confirmation,
		isClient
	}: { tally: ReviewTally; versionNumber: number; confirmation: ContextConfirmation | null; isClient: boolean } =
		$props();

	const isOpen = $derived(canConfirm(tally));
	const title = $derived(isClient ? 'Confirm your company context' : "The client's confirmation");
</script>

<DashboardPanel {title}>
	<div class="flex flex-col gap-3 px-4 py-4 text-sm">
		{#if confirmation !== null}
			<p class="text-chalk/80">{confirmedSentence(confirmation, isClient)}</p>
			{#if isClient}
				<p class="text-chalk/70">What happens next: {whatHappensNext}</p>
				<a href={portalHomePath} class="self-start text-chalk underline">See your projects</a>
			{:else}
				<p class="text-chalk/70">{staffNextStep}</p>
			{/if}
		{:else if !isClient}
			<p class="text-chalk/70">{notConfirmedYet}</p>
		{:else if isOpen}
			<ContextConfirmForm {versionNumber} />
		{:else}
			<p class="text-chalk/70">{confirmationHeldBack(tally)}</p>
		{/if}
	</div>
</DashboardPanel>
