import { drizzle } from 'drizzle-orm/postgres-js';
import { like, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { hashPassword } from 'better-auth/crypto';
import { user, account } from '../src/lib/server/db/auth.schema.ts';

// Données de test uniquement : ne jamais lancer sur une base de production.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const FAKE_EMAIL_DOMAIN = 'clubzik.invalid';
const SEED_PASSWORD = 'password1234'; // même mot de passe pour tous les comptes de test
const SEED_ID_PREFIX = 'seed-'; // permet de retrouver (et nettoyer) nos lignes

// Musiciens : [prénom, nom, groupe]
const MUSICIANS = [
	['Freddie', 'Mercury', 'Queen'],
	['Brian', 'May', 'Queen'],
	['Roger', 'Taylor', 'Queen'],
	['John', 'Deacon', 'Queen'],
	['John', 'Lennon', 'The Beatles'],
	['Paul', 'McCartney', 'The Beatles'],
	['George', 'Harrison', 'The Beatles'],
	['Ringo', 'Starr', 'The Beatles'],
	['Kurt', 'Cobain', 'Nirvana'],
	['Krist', 'Novoselic', 'Nirvana'],
	['Dave', 'Grohl', 'Nirvana'],
	['Thom', 'Yorke', 'Radiohead'],
	['Jonny', 'Greenwood', 'Radiohead'],
	['Colin', 'Greenwood', 'Radiohead'],
	['Phil', 'Selway', 'Radiohead'],
	['Thomas', 'Bangalter', 'Daft Punk'],
	['Guy-Manuel', 'de Homem-Christo', 'Daft Punk'],
	['Matthew', 'Bellamy', 'Muse'],
	['Chris', 'Wolstenholme', 'Muse'],
	['Dominic', 'Howard', 'Muse'],
	['Jimi', 'Hendrix', null],
	['Amy', 'Winehouse', null]
] as const;

const BANDS = [
	['Queen', 'Rock britannique, opéra rock et grands chœurs.'],
	['The Beatles', 'Pop-rock de Liverpool, du Cavern Club à Abbey Road.'],
	['Nirvana', 'Grunge de Seattle.'],
	['Radiohead', 'Rock alternatif et expérimental.'],
	['Daft Punk', 'Duo électro français.'],
	['Muse', 'Rock alternatif aux accents progressifs.']
] as const;

// Créneaux de réservation : [jours à partir d'aujourd'hui, heure de début, durée en h, type, groupe ou utilisateur]
// Les créneaux ne se chevauchent jamais (contrainte booking_no_overlap).
const BOOKINGS = [
	[1, 18, 2, 'rehearsal', 'Queen'],
	[1, 20, 2, 'rehearsal', 'Muse'],
	[2, 18, 3, 'rehearsal', 'The Beatles'],
	[3, 19, 2, 'rehearsal', 'Nirvana'],
	[4, 17, 2, 'course', 'Brian May'],
	[4, 20, 2, 'rehearsal', 'Radiohead'],
	[5, 18, 4, 'jam', 'Jimi Hendrix'],
	[6, 14, 2, 'rehearsal', 'Daft Punk'],
	[8, 18, 2, 'rehearsal', 'Queen'],
	[9, 19, 3, 'concert', 'Radiohead'],
	[10, 18, 2, 'other', 'Amy Winehouse'],
	[11, 18, 2, 'rehearsal', 'Muse']
] as const;

// Créneaux réguliers : [jour (0 = lundi), début, fin, type, groupe ou utilisateur, début de période, fin de période]
// Deux créneaux du même jour ne doivent pas se chevaucher si leurs périodes se recoupent
// (règle vérifiée par la page admin, pas par la base).
const YEAR = ['2026-09-01', '2027-06-30'] as const;
const SEMESTER_1 = ['2026-09-01', '2027-01-31'] as const;
const SEMESTER_2 = ['2027-02-01', '2027-06-30'] as const;
const REGULAR_BOOKINGS = [
	[0, '12:00', '14:00', 'jam', 'Jimi Hendrix', ...YEAR],
	[0, '14:00', '16:00', 'course', 'Brian May', ...SEMESTER_1],
	[0, '14:00', '16:00', 'course', 'Roger Taylor', ...SEMESTER_2],
	[0, '18:00', '20:00', 'rehearsal', 'Queen', ...YEAR],
	[0, '20:00', '22:00', 'rehearsal', 'Muse', ...YEAR],
	[1, '12:00', '14:00', 'jam', 'Amy Winehouse', ...YEAR],
	[1, '18:00', '20:00', 'rehearsal', 'The Beatles', ...YEAR],
	[1, '20:00', '22:00', 'rehearsal', 'Nirvana', ...YEAR],
	[2, '12:00', '14:00', 'course', 'Brian May', ...YEAR],
	[2, '18:00', '20:00', 'rehearsal', 'Radiohead', ...YEAR],
	[2, '20:00', '22:00', 'rehearsal', 'Daft Punk', ...YEAR],
	[3, '12:00', '14:00', 'jam', 'Jimi Hendrix', ...YEAR],
	[3, '17:00', '19:00', 'course', 'Roger Taylor', ...YEAR],
	[3, '19:00', '21:00', 'rehearsal', 'Queen', ...YEAR],
	[4, '12:00', '14:00', 'jam', 'Amy Winehouse', ...YEAR],
	[4, '18:00', '20:00', 'rehearsal', 'Muse', ...YEAR],
	[4, '20:00', '22:00', 'other', 'Jonny Greenwood', ...YEAR],
	[5, '14:00', '16:00', 'rehearsal', 'Daft Punk', ...YEAR],
	[5, '16:00', '18:00', 'rehearsal', 'Nirvana', ...YEAR],
	[6, '15:00', '17:00', 'rehearsal', 'The Beatles', ...YEAR]
] as const;

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

function usernameOf(firstName: string, lastName: string) {
	return `${firstName}.${lastName}`
		.toLowerCase()
		.normalize('NFD')
		.replace(/[^a-z0-9.]/g, '');
}

// Idempotent : on supprime d'abord les anciennes données de seed (cascade sur membres et réservations).
// Les groupes seedés sont retrouvés par nom, pour ne pas toucher aux vrais groupes du club.
// (SQL brut : schema.ts importe './auth.schema' sans extension, ce que Node ne résout pas hors de Vite)
await db.execute(
	sql`DELETE FROM band WHERE name IN (${sql.join(
		BANDS.map(([name]) => sql`${name}`),
		sql`, `
	)})`
);
await db.delete(user).where(like(user.id, `${SEED_ID_PREFIX}%`));

const passwordHash = await hashPassword(SEED_PASSWORD);

const users = MUSICIANS.map(([firstName, lastName, bandName]) => {
	const username = usernameOf(firstName, lastName);
	return {
		id: `${SEED_ID_PREFIX}${username}`,
		name: `${firstName} ${lastName}`,
		email: `${username}@${FAKE_EMAIL_DOMAIN}`,
		emailVerified: false,
		username,
		displayUsername: username,
		firstName,
		lastName,
		isApproved: true,
		isStaff: false,
		bandName
	};
});

await db.insert(user).values(users.map(({ bandName: _bandName, ...row }) => row));
await db.insert(account).values(
	users.map((u) => ({
		id: `${u.id}-credential`,
		accountId: u.id,
		providerId: 'credential',
		userId: u.id,
		password: passwordHash
	}))
);

const bandIdByName = new Map<string, number>();
for (const [name, description] of BANDS) {
	const rows = await db.execute<{ id: number }>(
		sql`INSERT INTO band (name, description) VALUES (${name}, ${description}) RETURNING id`
	);
	bandIdByName.set(name, rows[0].id);
}

for (const u of users) {
	if (u.bandName === null) continue;
	await db.execute(
		sql`INSERT INTO band_member (band_id, user_id) VALUES (${bandIdByName.get(u.bandName)!}, ${u.id})`
	);
}

// Un nouveau membre en attente de validation, pour tester ADM-02
await db.insert(user).values({
	id: `${SEED_ID_PREFIX}pending`,
	name: 'Syd Barrett',
	email: `syd.barrett@${FAKE_EMAIL_DOMAIN}`,
	username: 'syd.barrett',
	displayUsername: 'syd.barrett',
	firstName: 'Syd',
	lastName: 'Barrett',
	isApproved: false
});

const userIdByFullName = new Map(users.map((u) => [u.name, u.id]));

const today = new Date();
today.setHours(0, 0, 0, 0);

const bookingRows = BOOKINGS.map(([dayOffset, startHour, hours, type, owner]) => {
	const start = new Date(today);
	start.setDate(start.getDate() + dayOffset);
	start.setHours(startHour);
	const end = new Date(start);
	end.setHours(startHour + hours);

	const bandId = bandIdByName.get(owner);
	const userId = userIdByFullName.get(owner);
	if (bandId === undefined && userId === undefined) throw new Error(`Titulaire inconnu : ${owner}`);
	return {
		start,
		end,
		type,
		bandId: bandId ?? null,
		userId: bandId === undefined ? userId! : null
	};
});
for (const row of bookingRows) {
	await db.execute(sql`INSERT INTO booking (start, "end", type, user_id, band_id)
		VALUES (${row.start.toISOString()}, ${row.end.toISOString()}, ${row.type}, ${row.userId}, ${row.bandId})`);
}

for (const [day, startTime, endTime, type, owner, validFrom, validTo] of REGULAR_BOOKINGS) {
	const bandId = bandIdByName.get(owner);
	const userId = userIdByFullName.get(owner);
	if (bandId === undefined && userId === undefined) throw new Error(`Titulaire inconnu : ${owner}`);
	await db.execute(sql`INSERT INTO regular_booking
		(day_of_week, start_time, end_time, type, user_id, band_id, valid_from, valid_to)
		VALUES (${day}, ${startTime}, ${endTime}, ${type}, ${bandId === undefined ? userId! : null}, ${bandId ?? null}, ${validFrom}, ${validTo})`);
}

await client.end();
console.log(
	`Seed terminé : ${users.length + 1} utilisateurs, ${BANDS.length} groupes, ${bookingRows.length} réservations, ${REGULAR_BOOKINGS.length} créneaux réguliers.`
);
console.log(`Connexion avec par ex. "freddie.mercury" / "${SEED_PASSWORD}".`);
