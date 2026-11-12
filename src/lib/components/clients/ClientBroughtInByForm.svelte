<script lang="ts">
	import BroughtInBySelect from './BroughtInBySelect.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let { ownerId, staffMembers }: { ownerId: string | null; staffMembers: StaffMember[] } = $props();

	function submitChosenPerson(event: Event & { currentTarget: HTMLSelectElement }): void {
		const select = event.currentTarget;
		select.form?.requestSubmit();
	}
</script>

<form method="POST" action="?/setBroughtInBy" class="max-w-xs">
	<FormField label="Brought in by">
		<BroughtInBySelect chosenId={ownerId} {staffMembers} onchange={submitChosenPerson} />
	</FormField>
</form>
