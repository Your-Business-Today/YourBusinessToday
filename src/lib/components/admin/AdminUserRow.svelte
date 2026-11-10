<script lang="ts">
	import AdminActionsMenu from '$lib/components/admin/AdminActionsMenu.svelte';
	import type { AdminUserSummary } from '$lib/server/admin/getAdminUserList';

	let { user }: { user: AdminUserSummary } = $props();

</script>

<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
	<div class="min-w-0">
		<p class="truncate font-display">
			{user.email}
			{#if user.isAdmin}
				<span class="ml-2 rounded-full bg-signal/15 px-2 py-0.5 text-xs text-signal">admin</span>
			{/if}
			{#if user.isStaff}
				<span class="ml-2 rounded-full bg-go/15 px-2 py-0.5 text-xs text-go">staff</span>
			{/if}
			{#if user.isRestricted}
				<span class="ml-2 rounded-full bg-caution/15 px-2 py-0.5 text-xs text-caution">
					restricted
				</span>
			{/if}
		</p>
	</div>
	<div class="flex items-center gap-3">
		<AdminActionsMenu {user} />
	</div>
</li>
