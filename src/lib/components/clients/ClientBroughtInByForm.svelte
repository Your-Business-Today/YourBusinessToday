<script lang="ts">
	import { selectClasses } from '$lib/components/site/formStyles';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let { ownerId, staffMembers }: { ownerId: string | null; staffMembers: StaffMember[] } = $props();

	const nobodyChosen = '';

	function submitChosenPerson(event: Event & { currentTarget: HTMLSelectElement }): void {
		const select = event.currentTarget;
		select.form?.requestSubmit();
	}
</script>

<form method="POST" action="?/setBroughtInBy" class="flex items-center gap-2 text-sm text-chalk/70">
	<label for="broughtInBy">Brought in by</label>
	<select
		id="broughtInBy"
		name="ownerId"
		value={ownerId ?? nobodyChosen}
		onchange={submitChosenPerson}
		class={`${selectClasses} py-1 text-sm`}
	>
		<option value={nobodyChosen} disabled>Nobody named</option>
		{#each staffMembers as member (member.id)}
			<option value={member.id}>{member.name}</option>
		{/each}
	</select>
</form>
