<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { inputClasses, panelClasses } from '$lib/components/site/formStyles';
	import type { OfficerAppointment } from '$lib/server/companiesHouse/officerAppointmentRecord';

	let {
		appointments,
		suggestedGroupName
	}: { appointments: OfficerAppointment[]; suggestedGroupName: string } = $props();

	function describe(appointment: OfficerAppointment): string {
		const since = appointment.appointedOn === '' ? '' : `since ${formatBritishDate(appointment.appointedOn)}`;
		return [appointment.officerRole, since, appointment.companyNumber, appointment.address]
			.filter(Boolean)
			.join(' · ');
	}
</script>

<form method="POST" action="?/importAppointments" class={panelClasses}>
	<h3 class="font-display text-lg">Companies they hold that are not yet on the register</h3>
	{#if appointments.length === 0}
		<p class="text-sm text-chalk/50">Every current appointment is already listed.</p>
	{/if}
	{#each appointments as appointment (appointment.companyNumber)}
		<label class="flex items-start gap-3 rounded-xl border border-hairline px-4 py-3">
			<input type="checkbox" name="chosen" value={appointment.companyNumber} checked class="mt-1 accent-go" />
			<input type="hidden" name="companyNumber" value={appointment.companyNumber} />
			<input type="hidden" name="companyName" value={appointment.companyName} />
			<input type="hidden" name="officerRole" value={appointment.officerRole} />
			<input type="hidden" name="appointedOn" value={appointment.appointedOn} />
			<input type="hidden" name="address" value={appointment.address} />
			<span class="min-w-0">
				<span class="block font-display">{appointment.companyName}</span>
				<span class="block text-xs text-chalk/50">{describe(appointment)}</span>
			</span>
		</label>
	{/each}
	{#if appointments.length > 0}
		<div class="flex flex-wrap items-end justify-between gap-3">
			<FormField label="Group them under (leave blank for none)">
				<input name="groupName" value={suggestedGroupName} class={inputClasses} />
			</FormField>
			<SubmitButton savingLabel="Adding…">Add selected companies as leads</SubmitButton>
		</div>
	{/if}
</form>
