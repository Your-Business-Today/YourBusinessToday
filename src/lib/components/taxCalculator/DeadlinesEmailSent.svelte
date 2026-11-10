<script lang="ts">
	import type { TaxYearName } from '$lib/data/taxCalculator/taxRuleTypes';
	import { outlineButtonClasses } from './calculatorStyles';

	let { taxYear, onSendAnother }: { taxYear: TaxYearName; onSendAnother: () => void } = $props();
</script>

<p class="text-sm text-chalk/70" role="status">
	<strong class="text-chalk">On its way.</strong> Look in your inbox for the {taxYear} deadlines and open the calendar
	file to add them. We haven’t kept your address.
</p>
<button type="button" onclick={onSendAnother} class={`${outlineButtonClasses} self-start`}>Send to another address</button>
