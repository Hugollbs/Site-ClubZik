import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	timestamp,
	time,
	date,
	primaryKey,
	check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';

export * from './auth.schema';

// Types de réservation (RESA-06)
export const bookingType = pgEnum('booking_type', [
	'rehearsal',
	'jam',
	'concert',
	'course',
	'other'
]);

export const band = pgTable('band', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description')
});

// Table de liaison n–n : un user dans plusieurs groupes, un groupe avec plusieurs users
export const bandMember = pgTable(
	'band_member',
	{
		bandId: integer('band_id')
			.notNull()
			.references(() => band.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.bandId, t.userId] })]
);

export const booking = pgTable(
	'booking',
	{
		id: serial('id').primaryKey(),
		start: timestamp('start', { withTimezone: true }).notNull(),
		end: timestamp('end', { withTimezone: true }).notNull(),
		type: bookingType('type').notNull().default('rehearsal'),
		// Titulaire : exactement un des deux (option 1A)
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		bandId: integer('band_id').references(() => band.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		check('booking_end_after_start', sql`${t.end} > ${t.start}`),
		check('booking_one_owner', sql`(${t.userId} IS NULL) <> (${t.bandId} IS NULL)`)
	]
);

export const regularBooking = pgTable(
	'regular_booking',
	{
		id: serial('id').primaryKey(),
		dayOfWeek: integer('day_of_week').notNull(), // 0 = lundi … 6 = dimanche
		startTime: time('start_time').notNull(),
		endTime: time('end_time').notNull(),
		type: bookingType('type').notNull().default('jam'),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		bandId: integer('band_id').references(() => band.id, { onDelete: 'cascade' }),
		validFrom: date('valid_from').notNull(),
		validTo: date('valid_to').notNull()
	},
	(t) => [
		check('regular_day_range', sql`${t.dayOfWeek} BETWEEN 0 AND 6`),
		check('regular_end_after_start', sql`${t.endTime} > ${t.startTime}`),
		check('regular_one_owner', sql`(${t.userId} IS NULL) <> (${t.bandId} IS NULL)`)
	]
);

export const visit = pgTable('visit', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow()
});
