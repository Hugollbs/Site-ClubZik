-- Contraintes que Drizzle ne sait pas exprimer : à appliquer APRÈS `npm run db:push`
-- avec `npm run db:constraints`. Le script peut être relancé sans risque (idempotent).

-- RESA-11 : deux réservations ne peuvent pas se chevaucher.
-- tstzrange est semi-ouvert : 10h-11h et 11h-12h sont donc compatibles.
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_no_overlap') THEN
		ALTER TABLE booking
			ADD CONSTRAINT booking_no_overlap
			EXCLUDE USING gist (tstzrange(start, "end") WITH &&);
	END IF;
END
$$;
