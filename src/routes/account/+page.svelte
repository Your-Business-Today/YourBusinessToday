<script lang="ts">
	import { enhance } from '$app/forms';
	import DisplayNameForm from '$lib/components/account/DisplayNameForm.svelte';
	import ModelChoicePanel from '$lib/components/account/ModelChoicePanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();

	let isProfileModalOpen = $state(false);

	const signOutTracker = new FormTracker();
</script>

<svelte:head>
	<title>Account — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<PageTitle>Account</PageTitle>
			<p class="text-chalk/70">{data.userEmail}</p>
		</div>
		<form method="POST" action="?/signOut" use:enhance={signOutTracker.submit()}>
			<SubmitButton
				isSaving={signOutTracker.isSaving}
				savingLabel="Signing out…"
				class="rounded-full border border-hairline px-6 py-2.5 font-display text-sm text-chalk/80
					transition hover:border-signal hover:text-signal"
			>
				Sign out
			</SubmitButton>
		</form>
	</div>
	{#if form?.message}
		<p class="rounded-2xl border border-go/50 bg-go/10 px-5 py-4 text-go">{form.message}</p>
	{/if}
	<div class="flex items-center justify-between rounded-2xl border border-hairline bg-carriage p-6">
		<div>
			<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">Display name</p>
			<p class="font-display text-lg">
				{data.displayName !== '' ? data.displayName : 'Not set'}
			</p>
		</div>
		<button
			type="button"
			onclick={() => (isProfileModalOpen = true)}
			class="rounded-full border border-hairline px-6 py-2.5 font-display text-sm text-chalk/80
				transition hover:border-go hover:text-go"
		>
			Edit profile
		</button>
	</div>
	<ModelChoicePanel modelId={data.modelId} adminPinnedModel={data.adminPinnedModel} />
</div>

<Modal title="Edit profile" bind:isOpen={isProfileModalOpen}>
	<DisplayNameForm displayName={data.displayName} onSaved={() => (isProfileModalOpen = false)} />
</Modal>
