<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FramePicker from './FramePicker.svelte';
	import { framePicksPath, type FramePickChoice, type FramePicks } from './framePicks';

	let { picks }: { picks: FramePicks } = $props();

	const pickFailedMessage = 'That pick could not be kept. Try again.';
	let errorMessage: string | null = $state(null);

	async function pick(choice: FramePickChoice): Promise<void> {
		errorMessage = null;
		const response = await fetch(framePicksPath, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(choice)
		});
		if (!response.ok) {
			errorMessage = pickFailedMessage;
			return;
		}
		const { homePath }: { homePath: string | null } = await response.json();
		if (homePath === null) return invalidateAll();
		await goto(homePath, { invalidateAll: true });
	}

	function pickOrganisation(organisationId: string): Promise<void> {
		return pick({ organisationId, projectId: null });
	}
</script>

<FramePicker
	caption="Organisation"
	options={picks.organisations}
	pickedId={picks.pickedOrganisationId}
	emptyLabel="No organisations"
	onPick={pickOrganisation}
/>
<FormErrorNote message={errorMessage} />
