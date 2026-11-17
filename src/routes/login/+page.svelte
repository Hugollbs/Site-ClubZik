<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm';
</script>

<h1 class="text-2xl font-bold">Connexion</h1>

<form method="post" use:enhance class="mt-4 flex max-w-sm flex-col gap-3">
	<label>
		Identifiant
		<input name="username" value={form?.username ?? ''} class={inputClass} required />
	</label>
	<label>
		Mot de passe
		<input type="password" name="password" class={inputClass} required />
	</label>
	<button class="rounded-md bg-blue-600 px-4 py-2 text-white">Se connecter</button>
</form>

<p class="mt-2 text-red-600">{form?.message ?? ''}</p>
<p class="mt-4 text-sm">Pas encore de compte ? <a href="/register" class="underline">S'inscrire</a></p>
