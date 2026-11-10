<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ContentPlanCounts from '$lib/components/brand/ContentPlanCounts.svelte';
	import ContentPlanKindTable from '$lib/components/brand/ContentPlanKindTable.svelte';
	import ContentPlanMoveModal from '$lib/components/brand/ContentPlanMoveModal.svelte';
	import ContentPlanWeekTable from '$lib/components/brand/ContentPlanWeekTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandCrumbsFor } from '$lib/components/brand/brandKitPageWords';
	import { contentPlanPathOf } from '$lib/components/brand/contentPlanPageWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { data, form } = $props();

	const { brandOrganisation: organisation, plan } = $derived(data);
	const answer = $derived(form?.message ?? null);
	let moving: PlanEntry | null = $state(null);
	let isMoving = $state(false);

	function startMoving(entry: PlanEntry) {
		moving = entry;
		isMoving = true;
	}
</script>

<svelte:head>
	<title>Plan for {plan.monthLabel} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandCrumbsFor(organisation)} title={`Plan for ${plan.monthLabel}`}>
	{#snippet actions()}
		<Button href={contentPlanPathOf(organisation.id, plan.previousMonthKey)}>Previous month</Button>
		<Button href={contentPlanPathOf(organisation.id, plan.nextMonthKey)}>Next month</Button>
	{/snippet}
	<p class="text-sm text-chalk-muted">
		Every post of the month on the day it goes out, so the gaps show. Your Claude plans ideas onto a day through the
		Your Business Today connector; move a post to another day here.
	</p>
	{#if answer !== null}
		<p role="status" class="text-sm text-go">{answer}</p>
	{/if}
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="This month" isPadded>
		<ContentPlanCounts counts={plan.counts} />
	</DashboardPanel>
	<DashboardPanel title="Kinds of post this month">
		<ContentPlanKindTable kindCounts={plan.kindCounts} />
	</DashboardPanel>
	{#each plan.weeks as week (week.key)}
		<DashboardPanel title={week.label} count={week.entryCount}>
			<ContentPlanWeekTable organisationId={organisation.id} {week} onMove={startMoving} />
		</DashboardPanel>
	{/each}
</div>

<ContentPlanMoveModal entry={moving} bind:isOpen={isMoving} />
