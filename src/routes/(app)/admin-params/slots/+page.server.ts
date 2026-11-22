import { asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { band, regularBooking, user } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

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

	return { slots };
};
