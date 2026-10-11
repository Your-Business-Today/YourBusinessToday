<script lang="ts">
	import EmailPasswordForm from '$lib/components/account/EmailPasswordForm.svelte';
	import GoogleSignInButton from '$lib/components/account/GoogleSignInButton.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Sign in — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
	{#if data.isInvited}
		<div class="rounded-2xl border border-go/40 bg-go/10 px-5 py-4 text-sm text-chalk/80">
			{#if data.invitedBy !== ''}
				<strong class="text-chalk">{data.invitedBy}</strong> has invited you to collaborate.
			{:else}
				You've been invited to collaborate.
			{/if}
			Sign in with the email address that received the invitation
			{data.next === '' ? 'and you can accept it from your workspace' : "and you'll land straight on it"}.
		</div>
	{/if}
	<div class="flex flex-col gap-2">
		<PageTitle>Sign in</PageTitle>
		<p class="text-chalk/70">
			New here? Create an account with your email address, or continue with Google.
		</p>
	</div>
	<EmailPasswordForm
		next={data.next}
		message={form?.message ?? null}
		isProblem={form?.isProblem ?? false}
	/>
	<div class="flex items-center gap-3 font-display text-xs tracking-widest text-chalk/40 uppercase">
		<span class="h-px flex-1 bg-hairline"></span>
		or
		<span class="h-px flex-1 bg-hairline"></span>
	</div>
	<GoogleSignInButton next={data.next} />
</div>
