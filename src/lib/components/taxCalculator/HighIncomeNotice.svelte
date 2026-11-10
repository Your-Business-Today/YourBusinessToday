<script lang="ts">
	let { isAllowanceTapered }: { isAllowanceTapered: boolean } = $props();
</script>

<aside class="flex flex-col gap-2 rounded-3xl border border-caution/30 bg-caution/5 p-6 text-sm text-chalk/75">
	<h3 class="font-display text-lg font-medium text-chalk">More moving parts than this estimate covers</h3>
	<p>
		Because you pay higher-rate tax{isAllowanceTapered ? ' and your personal allowance is being tapered' : ''}, things
		like salary sacrifice, dividends, rental income or Gift Aid can shift the figure a lot. Worth a word with an
		accountant before you rely on it.
	</p>
</aside>
