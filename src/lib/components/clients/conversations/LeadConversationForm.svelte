<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { conversationChannelLabels, conversationChannels, leadConversationLimits } from '$lib/data/leadConversationRules';
	import { inputClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let { people, staffMembers, viewerId }: { people: ClientPerson[]; staffMembers: StaffMember[]; viewerId: string } = $props();
</script>

<form method="POST" action="?/logConversation" class="flex flex-col gap-4">
	<FormField label="When">
		<input name="heldOn" type="date" required class={inputClasses} />
	</FormField>
	<FormField label="How">
		<select name="channel" required class={selectClasses}>
			{#each conversationChannels as channel (channel)}
				<option value={channel}>{conversationChannelLabels[channel]}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Who on our side">
		<select name="heldBy" required value={viewerId} class={selectClasses}>
			{#each staffMembers as member (member.id)}
				<option value={member.id}>{member.name}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="With">
		<select name="personId" class={selectClasses}>
			<option value="">Nobody listed</option>
			{#each people as person (person.id)}
				<option value={person.id}>{person.name}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Summary" hint="What the conversation came to. Nothing personal.">
		<textarea name="summary" rows="4" required maxlength={leadConversationLimits.longestSummary} class={inputClasses}></textarea>
	</FormField>
	<FormField label="Key information about the deal" hint="What they spend now, what they need, the next step: one point to a line.">
		<textarea name="dealPoints" rows="5" maxlength={leadConversationLimits.longestDealPoints} class={inputClasses}></textarea>
	</FormField>
	<SubmitButton>Log conversation</SubmitButton>
</form>
