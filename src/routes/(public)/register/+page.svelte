<script lang="ts">
  import { TextInput, Button } from 'azucar-ui';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import type { Component } from 'svelte';
  import { User, UserPlus, Lock, LockKeyhole } from 'lucide-svelte';

  let { form }: { form: ActionData } = $props();

  let username = $state(form?.values?.username ?? '');
  let firstName = $state(form?.values?.firstName ?? '');
  let lastName = $state(form?.values?.lastName ?? '');
  let password = $state('');
  let passwordConfirm = $state('');
</script>

<h1 class="text-2xl font-bold">Créer un compte</h1>

<form method="post" use:enhance class="mt-4 flex max-w-sm flex-col gap-4">
  <TextInput
    name="username"
    bind:value={username}
    type="text"
    placeholder="identifiant (login INP-net conseillé)"
    icon={User}
    required
  >
    Identifiant
  </TextInput>

  <TextInput
    name="firstName"
    bind:value={firstName}
    type="text"
    placeholder="prénom"
    icon={UserPlus}
    required
  >
    Prénom
  </TextInput>

  <TextInput
    name="lastName"
    bind:value={lastName}
    type="text"
    placeholder="nom"
    icon={UserPlus}
    required
  >
    Nom
  </TextInput>

  <TextInput
    name="password"
    bind:value={password}
    type="password"
    placeholder="•••••••• (8 caractères min)"
    icon={Lock}
    required
  >
    Mot de passe
  </TextInput>

  <TextInput
    name="passwordConfirm"
    bind:value={passwordConfirm}
    type="password"
    placeholder="•••••••• (confirmation)"
    icon={LockKeyhole}
    required
  >
    Confirmer le mot de passe
  </TextInput>

  <div style="margin-bottom: 10px;">
  	<Button type="submit">S'inscrire</Button>
  </div>
</form>

{#if form?.message}
  <p class="mt-2 text-red-600">{form.message}</p>
{/if}

<p class="mt-4 text-sm">Ton compte devra être validé par un admin avant que tu puisses réserver.</p>