import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user } from '../src/lib/server/db/auth.schema.ts';

// Ce script tourne hors de SvelteKit : on lit DATABASE_URL directement (chargé par --env-file)
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Better Auth met l'identifiant en minuscules : on fait pareil pour retrouver le compte
const username = process.argv[2]?.trim().toLowerCase();
if (!username) {
	console.error('Usage : npm run admin:promote -- <identifiant>');
	process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const updated = await db
	.update(user)
	.set({ isStaff: true, isApproved: true })
	.where(eq(user.username, username))
	.returning({ username: user.username });

await client.end();

if (updated.length === 0) {
	console.error(`Aucun compte "${username}". Il doit d'abord s'inscrire via /register.`);
	process.exit(1);
}
console.log(`"${username}" est maintenant admin et approuvé.`);
