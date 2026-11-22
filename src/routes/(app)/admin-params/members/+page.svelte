<script lang="ts">
	import { Button } from 'azucar-ui';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<section class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Nouveaux membres à vérifier</h2>

	{#if form?.message}
		<p role="alert">{form.message}</p>
	{/if}

	{#each data.pendingMembers as member (member.id)}
		<div class="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
			<span>{member.firstName} {member.lastName} · {member.username}</span>

			<div class="flex gap-2">
				<form method="post" action="?/accept" use:enhance>
					<input type="hidden" name="id" value={member.id} />
					<Button type="submit">Accepter</Button>
				</form>
				<form method="post" action="?/reject" use:enhance>
					<input type="hidden" name="id" value={member.id} />
					<Button type="submit" variant="outline">Refuser</Button>
				</form>
			</div>
		</div>
	{:else}
		<p>Aucun nouveau membre à valider.</p>
	{/each}
</section>
