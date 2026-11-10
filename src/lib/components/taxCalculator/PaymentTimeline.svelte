<script lang="ts">
	import type { PaymentPlan } from '$lib/data/taxCalculator/paymentPlan';
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
	import { formatMoney, formatPercentage } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { plan, profit }: { plan: PaymentPlan; profit: number } = $props();

	const setAsideFractionDigits = 1;
	const timeLeft = $derived(
		plan.monthsRemaining >= 1 ? `${plan.monthsRemaining} months away` : `${plan.daysRemaining} days away`
	);
	const setAsideShare = $derived(profit > 0 ? plan.amountDue / profit : null);
	const tiles = $derived([
		{ amount: formatMoney(plan.monthlySetAside), label: 'a month from now' },
		{ amount: formatMoney(plan.quarterlySetAside), label: 'a quarter from now' }
	]);
</script>

<p class="text-chalk/75">
	<strong class="font-display text-3xl font-medium text-chalk">{formatMoney(plan.amountDue)}</strong><br />
	due by <strong class="text-chalk">{formatLongDate(plan.dueOn)}</strong>
	{#if plan.isOverdue}
		<span class="font-medium text-caution">— overdue. Speak to HMRC or your accountant; penalties and interest may apply.</span>
	{:else}
		<span class="text-chalk/55">({timeLeft})</span>
	{/if}
</p>
{#if !plan.isOverdue}
	<div class="grid grid-cols-2 gap-3">
		{#each tiles as tile (tile.label)}
			<div class="rounded-2xl bg-night/60 p-4">
				<p class="font-display text-xl text-chalk">{tile.amount}</p>
				<p class="text-xs text-chalk/55">{tile.label}</p>
			</div>
		{/each}
	</div>
	{#if setAsideShare !== null}
		<p class="text-sm text-chalk/70">
			<strong class="text-chalk">Rule of thumb:</strong> put {formatPercentage(setAsideShare, setAsideFractionDigits)} of
			every payment you receive aside and next year’s bill takes care of itself.
		</p>
	{/if}
{/if}
