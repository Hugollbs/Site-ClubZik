<script lang="ts">
	import { Button, Table, TextInput } from 'azucar-ui';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const yesNo = (value: boolean | null) => (value ? 'Oui' : 'Non');
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

<section class="mt-8 flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-xl font-bold">Tous les membres</h2>

		<!-- Formulaire GET : la recherche vit dans l'URL (?q=…), donc elle survit au rechargement -->
		<form method="get" class="w-full max-w-sm">
			<TextInput
				type="search"
				name="q"
				value={data.search}
				placeholder="Rechercher un membre…"
				class="w-full"
			/>
		</form>
	</div>

	<Table>
		<thead>
			<tr>
				<th>Utilisateur</th>
				<th>Admin</th>
				<th>Vérif</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.members as member (member.id)}
				<tr>
					<td>{member.firstName} {member.lastName} · {member.username}</td>
					<td>{yesNo(member.isStaff)}</td>
					<td>{yesNo(member.isApproved)}</td>
					<td>
						<Button
							href={resolve('/(app)/admin-params/members/[id]', { id: member.id })}
							variant="outline"
						>
							Modifier
						</Button>
						<!-- Pas de bouton sur sa propre ligne : le serveur refuse de toute façon -->
						{#if member.id !== data.currentUserId}
							<form
								method="post"
								action="?/remove"
								class="inline"
								use:enhance={({ cancel }) => {
									const fullName = `${member.firstName} ${member.lastName}`;
									if (!confirm(`Supprimer ${fullName} ? Ses réservations seront aussi supprimées.`)) {
										cancel();
									}
								}}
							>
								<input type="hidden" name="id" value={member.id} />
								<Button type="submit" variant="outline">Supprimer</Button>
							</form>
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4">Aucun membre ne correspond à « {data.search} ».</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</section>
