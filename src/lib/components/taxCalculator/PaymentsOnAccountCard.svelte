<script lang="ts">
	import type { PaymentsOnAccount } from '$lib/data/taxCalculator/paymentsOnAccount';
	import { paymentsOnAccountRules } from '$lib/data/taxCalculator/sharedRules';
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
	import { formatMoney, formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import WidgetIcon from './WidgetIcon.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let { payments }: { payments: PaymentsOnAccount } = $props();
</script>

<article class={widgetCardClasses}>
	<WidgetIcon name="receipt" toneClasses="bg-caution/15 text-caution" />
	<h3 class="font-display text-xl font-medium">Heads up: payments on account</h3>
	<p class="text-sm text-chalk/70">
		With a bill of {formatWholePounds(paymentsOnAccountRules.smallestBillThatNeedsThem)} or more, HMRC also asks for
		two advance payments towards next year — each half of this year’s income tax and Class 4:
	</p>
	<ul class="flex flex-col gap-2 text-sm">
		<li class="flex justify-between gap-3 rounded-xl bg-night/60 px-4 py-3">
			<span class="text-chalk/70">{formatLongDate(payments.firstDueOn)}</span><strong class="font-mono">{formatMoney(payments.eachPayment)}</strong>
		</li>
		<li class="flex justify-between gap-3 rounded-xl bg-night/60 px-4 py-3">
			<span class="text-chalk/70">{formatLongDate(payments.secondDueOn)}</span><strong class="font-mono">{formatMoney(payments.eachPayment)}</strong>
		</li>
	</ul>
	<p class="text-xs text-chalk/55">Not included above. If next year looks quieter, you can ask HMRC to reduce them.</p>
</article>
