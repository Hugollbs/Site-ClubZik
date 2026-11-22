<script lang="ts">
	import { Button, Switch, TextInput } from 'azucar-ui';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Après une erreur, on réaffiche ce que l'admin a saisi ; sinon les valeurs actuelles du membre
	const values = $derived({
		username: form?.values?.username ?? data.member.displayUsername ?? data.member.username ?? '',
		firstName: form?.values?.firstName ?? data.member.firstName,
		lastName: form?.values?.lastName ?? data.member.lastName,
		isStaff: form?.values?.isStaff ?? data.member.isStaff ?? false
	});
</script>

<h2 class="text-xl font-bold">Modifier un membre</h2>

<div class="mt-4 grid gap-8 md:grid-cols-2">
	<form method="post" use:enhance class="flex max-w-md flex-col gap-4">
		<TextInput name="username" value={values.username} required>Nom d'utilisateur</TextInput>
		<TextInput name="firstName" value={values.firstName} required>Prénom</TextInput>
		<TextInput name="lastName" value={values.lastName} required>Nom</TextInput>
		<Switch name="isStaff" checked={values.isStaff}>Administrateur</Switch>

		{#if form?.message}
			<p role="alert">{form.message}</p>
		{/if}

		<div class="flex gap-4">
			<Button href={resolve('/(app)/admin-params/members')} variant="outline">Annuler</Button>
			<Button type="submit">Enregistrer</Button>
		</div>
	</form>

	<aside class="h-fit rounded-lg border p-4">
		<h3 class="font-bold">Notes</h3>
		<ul class="mt-2 flex list-disc flex-col gap-2 pl-5">
			<li>Les champs sont préremplis avec les valeurs actuelles.</li>
			<li>Seul un compte déjà validé peut devenir administrateur.</li>
			<li>Le dernier administrateur ne peut pas être rétrogradé.</li>
			<li>Accepter ou refuser un nouveau membre se fait depuis la liste.</li>
		</ul>
	</aside>
</div>
