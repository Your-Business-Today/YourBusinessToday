<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import {
		fieldClasses,
		primaryButtonClasses
	} from '$lib/components/account/accountFormStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Set your password — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-medium">Set your password</h1>
		<p class="text-chalk/70">
			Choose the password you will use to sign in as {data.emailAddress}.
		</p>
	</div>
	<form method="POST" action="?/setPassword" class="flex flex-col gap-4">
		<SmallCapsField label="New password">
			<input
				name="password"
				type="password"
				autocomplete="new-password"
				required
				class={fieldClasses}
			/>
		</SmallCapsField>
		<SmallCapsField label="Type it again">
			<input
				name="confirmation"
				type="password"
				autocomplete="new-password"
				required
				class={fieldClasses}
			/>
		</SmallCapsField>
		<FormErrorNote message={form?.message ?? null} />
		<button type="submit" class={primaryButtonClasses}>Save password</button>
	</form>
</div>
