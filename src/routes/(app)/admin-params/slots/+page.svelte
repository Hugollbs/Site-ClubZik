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

	// Responsable : le texte tapé filtre les suggestions, la valeur choisie ("band:<id>" ou
	// "user:<id>") est envoyée au serveur par un champ caché
	let ownerSearch = $state('');
	let ownerValue = $state('');
	let listOpen = $state(false);

	const matches = (text: string) => text.toLowerCase().includes(ownerSearch.trim().toLowerCase());
	const allBands = $derived(data.bands.filter((b) => matches(b.name)));
	const allMembers = $derived(
		data.members.filter((m) => matches(`${m.firstName} ${m.lastName} ${m.username}`))
	);

	// La liste ne défile pas (la page défile déjà) : on n'affiche que les premiers résultats
	// et on invite à préciser la recherche pour le reste
	const MAX_SUGGESTIONS = 6;
	const shownBands = $derived(allBands.slice(0, MAX_SUGGESTIONS));
	const shownMembers = $derived(allMembers.slice(0, MAX_SUGGESTIONS - shownBands.length));
	const hiddenCount = $derived(allBands.length + allMembers.length - MAX_SUGGESTIONS);

	function chooseOwner(value: string, label: string) {
		ownerValue = value;
		ownerSearch = label;
		listOpen = false;
	}

	// Dès qu'on retape, l'ancien choix n'est plus valable
	function onOwnerInput() {
		ownerValue = '';
		listOpen = true;
	}
</script>

<section class="flex flex-col gap-4 p-4">
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
			<div class="owner-picker">
				<TextInput
					type="search"
					bind:value={ownerSearch}
					placeholder="Rechercher un utilisateur ou un groupe…"
					autocomplete="off"
					oninput={onOwnerInput}
					onfocus={() => (listOpen = true)}
					onblur={() => (listOpen = false)}
					onkeydown={(e: KeyboardEvent) => e.key === 'Escape' && (listOpen = false)}
				>
					Responsable
				</TextInput>
				<input type="hidden" name="owner" value={ownerValue} />

				{#if listOpen}
					<!-- mousedown + preventDefault : le champ garde le focus, sinon le blur
					     fermerait la liste avant que le clic ne soit pris en compte -->
					<ul class="owner-list" onmousedown={(e) => e.preventDefault()} role="listbox">
						{#if shownBands.length === 0 && shownMembers.length === 0}
							<li class="owner-empty">Aucun résultat</li>
						{/if}
						{#if shownBands.length > 0}
							<li class="owner-group">Groupes</li>
							{#each shownBands as b (b.id)}
								<li role="option" aria-selected={ownerValue === `band:${b.id}`}>
									<button type="button" onclick={() => chooseOwner(`band:${b.id}`, b.name)}>
										{b.name}
									</button>
								</li>
							{/each}
						{/if}
						{#if shownMembers.length > 0}
							<li class="owner-group">Membres</li>
							{#each shownMembers as m (m.id)}
								<li role="option" aria-selected={ownerValue === `user:${m.id}`}>
									<button
										type="button"
										onclick={() => chooseOwner(`user:${m.id}`, `${m.firstName} ${m.lastName}`)}
									>
										{m.firstName}
										{m.lastName} · {m.username}
									</button>
								</li>
							{/each}
						{/if}
						{#if hiddenCount > 0}
							<li class="owner-empty">… et {hiddenCount} autres, précise ta recherche</li>
						{/if}
					</ul>
				{/if}
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

<section class="slots-table mt-8 flex flex-col gap-4">
	<h2 class="text-xl font-bold">Créneaux réguliers existants</h2>

	<Table>
		<thead>
			<tr>
				<th>Type</th>
				<th>Responsable</th>
				<th>Jour</th>
				<th>Créneau</th>
				<th>Période</th>
				<th>Actions</th>
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
					<td>
						<form
							method="post"
							action="?/remove"
							use:enhance={({ cancel }) => {
								if (!confirm('Supprimer ce créneau régulier ?')) cancel();
							}}
						>
							<input type="hidden" name="id" value={slot.id} />
							<Button type="submit" variant="outline">Supprimer</Button>
						</form>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="6">Aucun créneau régulier pour l'instant.</td>
				</tr>
			{/each}
		</tbody>
	</Table>
</section>

<style>
	/* Le Table d'azucar-ui met `overflow: auto` sur son conteneur : il devient alors une zone
	   qui défile dans le cadre de la page, qui défile déjà. On le laisse donc s'étirer :
	   le tableau prend toute la largeur et seule la page défile. */
	.slots-table :global(div.table-wrapper) {
		overflow: visible;
	}

	/* Champs natifs (heure, date, liste) : azucar-ui n'a pas de composant pour eux,
	   on réutilise ses variables de thème pour qu'ils aient le même rendu que TextInput */
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--size-xxs);
	}

	.field input {
		padding: var(--size-sm) var(--size-md);
		background-color: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--corner-radius);
		color: inherit;
		font: inherit;
	}

	/* Liste de suggestions du responsable, posée sous le champ */
	.owner-picker {
		position: relative;
	}

	.owner-list {
		position: absolute;
		z-index: 10;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: var(--size-xxs);
		padding: var(--size-xxs);
		list-style: none;
		background-color: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--corner-radius);
	}

	.owner-group {
		padding: var(--size-xs) var(--size-md);
		font-size: 0.8em;
		font-weight: bold;
		text-transform: uppercase;
		opacity: 0.6;
	}

	.owner-empty {
		padding: var(--size-sm) var(--size-md);
		opacity: 0.6;
	}

	.owner-list button {
		width: 100%;
		padding: var(--size-sm) var(--size-md);
		text-align: left;
		background: none;
		border: none;
		border-radius: var(--corner-radius);
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.owner-list button:hover,
	.owner-list button:focus-visible,
	.owner-list [aria-selected='true'] button {
		background-color: var(--color-border);
	}
</style>
