<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import {
		noticeClasses,
		primaryButtonClasses,
		quietButtonClasses
	} from './accountFormStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		next = '',
		message = null,
		isProblem = false
	}: { next?: string; message?: string | null; isProblem?: boolean } = $props();

	let isCreatingAccount = $state(false);

	const signInAction = '?/signInWithPassword';
	const createAccountAction = '?/createAccount';
	const passwordResetAction = '?/sendPasswordReset';

	const problemMessage = $derived(isProblem ? message : null);
	const noticeMessage = $derived(isProblem ? null : message);
</script>

<form
	method="POST"
	action={isCreatingAccount ? createAccountAction : signInAction}
	class="flex flex-col gap-4"
>
	<input type="hidden" name="next" value={next} />
	<SmallCapsField label="Email">
		<input name="email" type="email" autocomplete="email" required class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Password">
		<input
			name="password"
			type="password"
			autocomplete={isCreatingAccount ? 'new-password' : 'current-password'}
			required
			class={fieldClasses}
		/>
	</SmallCapsField>
	<FormErrorNote message={problemMessage} />
	{#if noticeMessage !== null}
		<p class={noticeClasses}>{noticeMessage}</p>
	{/if}
	<button type="submit" class={primaryButtonClasses}>
		{isCreatingAccount ? 'Create account' : 'Sign in'}
	</button>
	{#if isCreatingAccount}
		<p class="text-xs text-chalk/50">
			By creating an account you agree to our
			<a href="/terms" class="text-chalk/80 underline underline-offset-4 hover:text-chalk">Terms</a>
			and
			<a href="/privacy" class="text-chalk/80 underline underline-offset-4 hover:text-chalk">
				Privacy Statement</a
			>.
		</p>
	{/if}
	<div class="flex items-center justify-between">
		<button
			type="button"
			class={quietButtonClasses}
			onclick={() => (isCreatingAccount = !isCreatingAccount)}
		>
			{isCreatingAccount ? 'I already have an account' : 'Create an account'}
		</button>
		<button type="submit" formaction={passwordResetAction} formnovalidate class={quietButtonClasses}>
			Email me a reset link
		</button>
	</div>
</form>
