<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { onboardingPrompt } from '$lib/onboarding/onboarding';
</script>

<DashboardPanel title="Your onboarding prompt">
	<div class="flex flex-col gap-3 px-4 py-4">
		<p class="text-sm text-chalk/70">Once your Claude is connected, paste this into a new chat.</p>
		<p class="font-mono text-sm text-chalk">{onboardingPrompt}</p>
		<CopyTextButton text={onboardingPrompt} label="Copy" />
	</div>
</DashboardPanel>
