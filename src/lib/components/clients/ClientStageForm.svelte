<script lang="ts">
	import { clientStageLabels, clientStageOrder, type ClientStage } from '$lib/data/clientLifecycle';
	import { selectClasses } from '$lib/components/site/formStyles';

	let { clientId, stage }: { clientId: string; stage: ClientStage } = $props();

	function submitChosenStage(event: Event & { currentTarget: HTMLSelectElement }): void {
		const select = event.currentTarget;
		select.form?.requestSubmit();
	}
</script>

<form method="POST" action="/clients?/moveStage" class="contents">
	<input type="hidden" name="clientId" value={clientId} />
	<select
		name="stage"
		value={stage}
		onchange={submitChosenStage}
		class={`${selectClasses} py-1 text-sm`}
		aria-label="Lifecycle stage"
	>
		{#each clientStageOrder as candidate (candidate)}
			<option value={candidate}>{clientStageLabels[candidate]}</option>
		{/each}
	</select>
</form>
