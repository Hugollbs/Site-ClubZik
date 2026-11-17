<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const inputClass =
		'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm';
</script>

<h1 class="text-2xl font-bold">Créer un compte</h1>

<form method="post" use:enhance class="mt-4 flex max-w-sm flex-col gap-3">
	<label>
		Identifiant (ton login INP-net est conseillé)
		<input name="username" value={form?.values?.username ?? ''} class={inputClass} required />
	</label>
	<label>
		Prénom
		<input name="firstName" value={form?.values?.firstName ?? ''} class={inputClass} required />
	</label>
	<label>
		Nom
		<input name="lastName" value={form?.values?.lastName ?? ''} class={inputClass} required />
	</label>
	<label>
		Mot de passe (8 caractères minimum)
		<input type="password" name="password" class={inputClass} required />
	</label>
	<label>
		Confirmer le mot de passe
		<input type="password" name="passwordConfirm" class={inputClass} required />
	</label>
	<button class="rounded-md bg-blue-600 px-4 py-2 text-white">S'inscrire</button>
</form>

<p class="mt-2 text-red-600">{form?.message ?? ''}</p>
<p class="mt-4 text-sm">Ton compte devra être validé par un admin avant que tu puisses réserver.</p>
