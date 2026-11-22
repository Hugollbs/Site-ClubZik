import { fail } from '@sveltejs/kit';
import { and, asc, eq, gt, gte, lt, lte } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { band, regularBooking, user } from '#lib/server/db/schema.ts';
import { BOOKING_TYPE_LABELS, WEEK_DAYS } from '#lib/slots.ts';
import type { Actions, PageServerLoad } from './$types';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Le format ne suffit pas : "2026-02-30" a la bonne forme mais n'existe pas.
// Date "déborde" sur mars, donc la date relue ne correspond plus au texte d'origine.
function isRealDate(text: string) {
	if (!DATE_PATTERN.test(text)) return false;
	const date = new Date(`${text}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

export const load: PageServerLoad = async () => {
	// Le responsable est soit un membre soit un groupe : deux jointures à gauche,
	// et une seule des deux est renseignée pour chaque créneau (contrainte regular_one_owner)
	const rows = await db
		.select({
			id: regularBooking.id,
			dayOfWeek: regularBooking.dayOfWeek,
			startTime: regularBooking.startTime,
			endTime: regularBooking.endTime,
			type: regularBooking.type,
			validFrom: regularBooking.validFrom,
			validTo: regularBooking.validTo,
			userFirstName: user.firstName,
			userLastName: user.lastName,
			bandName: band.name
		})
		.from(regularBooking)
		.leftJoin(user, eq(regularBooking.userId, user.id))
		.leftJoin(band, eq(regularBooking.bandId, band.id))
		.orderBy(
			asc(regularBooking.dayOfWeek),
			asc(regularBooking.startTime),
			asc(regularBooking.validFrom)
		);

	const slots = rows.map((row) => ({
		id: row.id,
		dayOfWeek: row.dayOfWeek,
		startTime: row.startTime,
		endTime: row.endTime,
		type: row.type,
		validFrom: row.validFrom,
		validTo: row.validTo,
		ownerName: row.bandName ?? `${row.userFirstName} ${row.userLastName}`
	}));

	// Choix possibles pour le responsable (ADM-10) : les groupes et les membres déjà validés
	const bands = await db.select({ id: band.id, name: band.name }).from(band).orderBy(asc(band.name));
	const members = await db
		.select({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username
		})
		.from(user)
		.where(eq(user.isApproved, true))
		.orderBy(asc(user.lastName), asc(user.firstName));

	return { slots, bands, members };
};

// Le champ "owner" du formulaire vaut "user:<id>" ou "band:<id>"
async function findOwnerColumns(owner: string) {
	const [kind, rawId] = owner.split(':');

	if (kind === 'band') {
		const id = Number(rawId);
		if (!Number.isInteger(id)) return null;
		const [found] = await db.select({ id: band.id }).from(band).where(eq(band.id, id));
		return found ? { userId: null, bandId: found.id } : null;
	}

	if (kind === 'user' && rawId) {
		const [found] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.id, rawId), eq(user.isApproved, true)));
		return found ? { userId: found.id, bandId: null } : null;
	}

	return null;
}

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const dayLabel = formData.get('day')?.toString() ?? '';
		const typeLabel = formData.get('type')?.toString() ?? '';
		const startTime = formData.get('startTime')?.toString() ?? '';
		const endTime = formData.get('endTime')?.toString() ?? '';
		const validFrom = formData.get('validFrom')?.toString() ?? '';
		const validTo = formData.get('validTo')?.toString() ?? '';
		const owner = formData.get('owner')?.toString() ?? '';

		const dayOfWeek = WEEK_DAYS.indexOf(dayLabel);
		if (dayOfWeek === -1) return fail(400, { message: 'Jour invalide.' });

		const type = Object.keys(BOOKING_TYPE_LABELS).find(
			(key) => BOOKING_TYPE_LABELS[key] === typeLabel
		) as typeof regularBooking.$inferInsert.type | undefined;
		if (!type) return fail(400, { message: 'Type invalide.' });

		if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
			return fail(400, { message: 'Heures invalides (format hh:mm).' });
		}
		// Comparer deux "hh:mm" comme du texte revient à les comparer comme des heures
		if (endTime <= startTime) {
			return fail(400, { message: "L'heure de fin doit être après l'heure de début." });
		}

		if (!isRealDate(validFrom) || !isRealDate(validTo)) {
			return fail(400, { message: 'Dates de période invalides.' });
		}
		if (validTo < validFrom) {
			return fail(400, { message: 'La fin de période doit être après le début.' });
		}

		const ownerColumns = await findOwnerColumns(owner);
		if (!ownerColumns) {
			return fail(400, { message: 'Choisis un responsable (membre validé ou groupe).' });
		}

		// Deux créneaux se chevauchent si, le même jour, leurs heures ET leurs périodes se recoupent.
		// Les bornes sont strictes côté heures : 12h-14h et 14h-16h sont compatibles.
		const [conflict] = await db
			.select({ id: regularBooking.id })
			.from(regularBooking)
			.where(
				and(
					eq(regularBooking.dayOfWeek, dayOfWeek),
					lt(regularBooking.startTime, endTime),
					gt(regularBooking.endTime, startTime),
					lte(regularBooking.validFrom, validTo),
					gte(regularBooking.validTo, validFrom)
				)
			)
			.limit(1);
		if (conflict) {
			return fail(400, { message: 'Ce créneau chevauche un créneau régulier existant.' });
		}

		await db.insert(regularBooking).values({
			dayOfWeek,
			startTime,
			endTime,
			type,
			validFrom,
			validTo,
			...ownerColumns
		});

		return { message: 'Créneau ajouté.' };
	}
};
