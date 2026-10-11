<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data } = $props();

	const projects = $derived(
		`${data.ownedProjectCount} project${data.ownedProjectCount === 1 ? '' : 's'} of your own and ${data.memberProjectCount} you are on as a team member`
	);
	const standing = $derived(
		data.isStaff
			? `${data.isAdmin ? 'an administrator' : 'a member of staff'} — it will be able to do what you can do across the whole site`
			: `an account holder with ${projects} — it will reach exactly those and nothing else`
	);
</script>

<svelte:head>
	<title>Connect {data.clientName} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
	<PageTitle>Connect {data.clientName}</PageTitle>
	<div class="flex flex-col gap-3 rounded-2xl border border-hairline p-6 text-chalk/80">
		<p>
			<strong class="text-chalk">{data.clientName}</strong> is asking to act as you on Your
			Business Today.
		</p>
		<p>You are signed in as <strong class="text-chalk">{data.email}</strong>, {standing}.</p>
		<p class="text-sm text-chalk/60">
			Everything it does is recorded under your name. You can disconnect it at any time from
			your account.
		</p>
	</div>
	<div class="flex flex-wrap items-center gap-4">
		<form method="POST" action={data.approvePath}>
			<SubmitButton savingLabel="Connecting…">Connect</SubmitButton>
		</form>
		<form method="POST" action={data.refusePath}>
			<SubmitButton class={quietButtonClasses} savingLabel="Cancelling…">Cancel</SubmitButton>
		</form>
	</div>
</div>
