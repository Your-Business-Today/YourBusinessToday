<script lang="ts">
	import { enhance } from '$app/forms';
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { billingFormFields, pauseStates } from '$lib/data/books/billingScheduleFormField';
	import type { BilledSchedule } from '$lib/data/books/organisationBilling';

	let { schedule, onEdit }: { schedule: BilledSchedule; onEdit: () => void } = $props();

	let isMenuOpen = $state(false);

	const tracker = new FormTracker();
	const pauseState = $derived(schedule.isPaused ? pauseStates.resume : pauseStates.pause);

	function openEdit() {
		isMenuOpen = false;
		onEdit();
	}
</script>

<ActionsMenu subjectName={schedule.title} menuWidthClass="w-44" isCompact bind:isOpen={isMenuOpen}>
	<button type="button" role="menuitem" onclick={openEdit} class={menuItemClasses}>Edit billing…</button>
	<form method="POST" action="?/pauseBilling" use:enhance={tracker.submit(() => (isMenuOpen = false))}>
		<input type="hidden" name={billingFormFields.scheduleId} value={schedule.id} />
		<input type="hidden" name={billingFormFields.isPaused} value={pauseState} />
		<button type="submit" role="menuitem" disabled={tracker.isSaving} class={menuItemClasses}>
			{schedule.isPaused ? 'Resume' : 'Pause'}
		</button>
	</form>
</ActionsMenu>
