<script lang="ts">
	import { selectClasses } from '$lib/components/site/formStyles';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let {
		chosenId,
		staffMembers,
		optionPrefix = '',
		onchange
	}: {
		chosenId: string | null;
		staffMembers: StaffMember[];
		optionPrefix?: string;
		onchange?: (event: Event & { currentTarget: HTMLSelectElement }) => void;
	} = $props();

	const nobodyChosen = '';
</script>

<select name="ownerId" value={chosenId ?? nobodyChosen} aria-label="Brought in by" class={selectClasses} {onchange}>
	<option value={nobodyChosen} disabled>Nobody named</option>
	{#each staffMembers as member (member.id)}
		<option value={member.id}>{optionPrefix}{member.name}</option>
	{/each}
</select>
