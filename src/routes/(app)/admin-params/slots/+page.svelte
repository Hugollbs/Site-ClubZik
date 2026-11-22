<script lang="ts">
	import { Table } from 'azucar-ui';
	import { formatDate, formatTime } from '#lib/format.ts';
	import { BOOKING_TYPE_LABELS, WEEK_DAYS } from '#lib/slots.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="flex flex-col gap-4">
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
