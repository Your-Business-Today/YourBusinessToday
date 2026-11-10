<script lang="ts">
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';

	let { dueOn }: { dueOn: string } = $props();
</script>

<p class="rounded-2xl border border-caution/30 bg-caution/5 p-4 text-sm text-chalk/75">
	<strong class="text-chalk">About the quarterly view:</strong> a rough picture of each Making Tax Digital update,
	assuming the year is spread evenly. You don’t pay tax quarterly — the bill is still due in one go by
	{formatLongDate(dueOn)}.
</p>
