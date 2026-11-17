import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db/index.ts';
import { username } from 'better-auth/plugins';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			firstName: { type: 'string', required: true },
			lastName: { type: 'string', required: true },
			// input: false = le client ne peut PAS fixer ces champs à l'inscription
			isApproved: { type: 'boolean', required: false, defaultValue: false, input: false },
			isStaff: { type: 'boolean', required: false, defaultValue: false, input: false }
		}
	},
	plugins: [
		username(),
		sveltekitCookies(getRequestEvent) // doit rester le dernier plugin
	]
});
