<script lang="ts">
	import { Button, Select, Table, TextInput } from 'azucar-ui';
	import { enhance } from '$app/forms';
	import { formatDate, formatTime } from '#lib/format.ts';
	import { BOOKING_TYPE_LABELS, WEEK_DAYS } from '#lib/slots.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Valeurs par défaut : les jams ont lieu le midi, de 12h à 14h
	const DEFAULT_TYPE = BOOKING_TYPE_LABELS.jam;
	const DEFAULT_START = '12:00';
	const DEFAULT_END = '14:00';

	// Recherche du responsable : on filtre les deux listes au fur et à mesure de la saisie
	let ownerSearch = $state('');
	const matches = (text: string) => text.toLowerCase().includes(ownerSearch.trim().toLowerCase());
	const shownBands = $derived(data.bands.filter((b) => matches(b.name)));
	const shownMembers = $derived(
		data.members.filter((m) => matches(`${m.firstName} ${m.lastName} ${m.username}`))
	);
</script>

<section class="flex flex-col gap-4 rounded-lg border p-4">
	<h2 class="text-xl font-bold">Ajouter un créneau régulier</h2>

	<form method="post" action="?/add" use:enhance class="flex flex-col gap-4">
		<div class="grid gap-4 md:grid-cols-4">
			<Select name="day" options={WEEK_DAYS} value={WEEK_DAYS[0]}>Jour</Select>

			<label class="field">
				<span>Début</span>
				<input type="time" name="startTime" value={DEFAULT_START} required />
			</label>
			<label class="field">
				<span>Fin</span>
				<input type="time" name="endTime" value={DEFAULT_END} required />
			</label>

			<Select name="type" options={Object.values(BOOKING_TYPE_LABELS)} value={DEFAULT_TYPE}>
				Type
			</Select>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-2">
				<TextInput type="search" bind:value={ownerSearch} placeholder="Rechercher un utilisateur ou un groupe…">
					Responsable
				</TextInput>
				<select name="owner" class="field-control" required>
					<option value="">— Choisir —</option>
					{#if shownBands.length > 0}
						<optgroup label="Groupes">
							{#each shownBands as b (b.id)}
								<option value={`band:${b.id}`}>{b.name}</option>
							{/each}
						</optgroup>
					{/if}
					{#if shownMembers.length > 0}
						<optgroup label="Membres">
							{#each shownMembers as m (m.id)}
								<option value={`user:${m.id}`}>{m.firstName} {m.lastName} · {m.username}</option>
							{/each}
						</optgroup>
					{/if}
				</select>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<label class="field">
					<span>Début de période</span>
					<input type="date" name="validFrom" required />
				</label>
				<label class="field">
					<span>Fin de période</span>
					<input type="date" name="validTo" required />
				</label>
			</div>
		</div>

		<div class="flex items-center gap-4">
			<Button type="submit">Ajouter</Button>
			{#if form?.message}
				<p role="alert">{form.message}</p>
			{/if}
		</div>
	</form>
</section>

<section class="mt-8 flex flex-col gap-4">
	<h2 class="text-xl font-bold">Créneaux réguliers existants</h2>

	<Table>
		<thead>
			<tr>
				<th>Type</th>
				<th>Responsable</th>
				<th>Jour</th>
				<th>Créneau</th>
				<th>Période</th>
			</tr>
		</thead>
		<tbody>
			{#each data.slots as slot (slot.id)}
				<tr>
					<td>{BOOKING_TYPE_LABELS[slot.type]}</td>
					<td>{slot.ownerName}</td>
					<td>{WEEK_DAYS[slot.dayOfWeek]}</td>
					<td>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</td>
					<td>{formatDate(slot.validFrom)} → {formatDate(slot.validTo)}</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5">Aucun créneau régulier pour l'instant.</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</section>

<style>
	/* Champs natifs (heure, date, liste) : azucar-ui n'a pas de composant pour eux,
	   on réutilise ses variables de thème pour qu'ils aient le même rendu que TextInput */
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--size-xxs);
	}

	.field input,
	.field-control {
		padding: var(--size-sm) var(--size-md);
		background-color: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--corner-radius);
		color: inherit;
		font: inherit;
	}
</style>
