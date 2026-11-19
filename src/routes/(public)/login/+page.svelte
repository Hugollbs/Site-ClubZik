<script lang="ts">
	import { TextInput, Button } from 'azucar-ui';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';
	import type { Component } from 'svelte';
	import { User, Lock } from 'lucide-svelte';

	let { form }: { form: ActionData } = $props();

	let username = $state(form?.username ?? '');
	let password = $state('');
</script>

<h1 class="text-2xl font-bold">Connexion</h1>

<form method="post" use:enhance class="mt-4 flex max-w-sm flex-col gap-4">
	<TextInput
		name="username"
		bind:value={username}
		type="text"
		placeholder="identifiant"
		icon={User as Component}
		required
	>
		Identifiant
	</TextInput>

	<TextInput
		name="password"
		bind:value={password}
		type="password"
		placeholder="••••••••"
		icon={Lock as Component}
		required
	>
		Mot de passe
	</TextInput>

  	<div style="margin-bottom: 10px;">
		<Button type="submit" variant="outline">Se connecter</Button>
	</div>
</form>

{#if form?.message}
  	<p class="mt-2 text-red-600">{form.message}</p>
{/if}

<p class="mt-6 text-sm">
  	Pas encore de compte ? <a href={resolve('/(public)/register')} class="underline">S'inscrire</a>
</p>