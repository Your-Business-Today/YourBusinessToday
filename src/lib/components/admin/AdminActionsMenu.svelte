<script lang="ts">
	import ActionsMenu from '$lib/components/site/ActionsMenu.svelte';
	import AdminMenuAction from '$lib/components/admin/AdminMenuAction.svelte';
	import SetPasswordModal from '$lib/components/admin/SetPasswordModal.svelte';
	import type { AdminUserSummary } from '$lib/server/admin/getAdminUserList';

	let { user }: { user: AdminUserSummary } = $props();

	let isOpen = $state(false);
	let isSetPasswordOpen = $state(false);

	function close() {
		isOpen = false;
	}

	function openSetPassword() {
		close();
		isSetPasswordOpen = true;
	}
</script>

<ActionsMenu subjectName={user.email} menuWidthClass="w-52" bind:isOpen>
	<AdminMenuAction
		action="?/sendPasswordReset"
		fields={{ targetEmail: user.email }}
		label="Send password reset"
		onDone={close}
	/>
	<button
		type="button"
		onclick={openSetPassword}
		class="w-full rounded-xl px-3 py-2 text-left font-display text-sm text-chalk/80 transition
			hover:bg-hairline/40 hover:text-chalk"
	>
		Set password
	</button>
	<AdminMenuAction
		action="?/setStaff"
		fields={{ targetEmail: user.email, shouldBeStaff: user.isStaff ? 'false' : 'true' }}
		label={user.isStaff ? 'Remove staff' : 'Make staff'}
		onDone={close}
	/>
	<AdminMenuAction
		action="?/setRestriction"
		fields={{ targetEmail: user.email, shouldRestrict: user.isRestricted ? 'false' : 'true' }}
		label={user.isRestricted ? 'Unrestrict' : 'Restrict'}
		onDone={close}
	/>
	{#if !user.isAdmin}
		<AdminMenuAction
			action="?/deleteUser"
			fields={{ targetEmail: user.email }}
			label="Delete account"
			isDestructive
			confirmMessage={`Delete ${user.email} and all of their data? This cannot be undone.`}
			onDone={close}
		/>
	{/if}
</ActionsMenu>

<SetPasswordModal targetEmail={user.email} bind:isOpen={isSetPasswordOpen} />
