<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { onePrompt } from '$lib/onboarding/onboarding';
</script>

<DashboardPanel title="Your one prompt">
	<div class="flex flex-col gap-3 px-4 py-4">
		<p class="text-sm text-chalk/70">
			Once your Claude is connected, paste this into a new chat. It maps how your business works as your
			workflow map. Run it again whenever your business changes: your Claude reads what we already hold and
			asks you only for what is still missing.
		</p>
		<p class="whitespace-pre-wrap font-mono text-sm text-chalk">{onePrompt}</p>
		<CopyTextButton text={onePrompt} label="Copy" />
	</div>
</DashboardPanel>
