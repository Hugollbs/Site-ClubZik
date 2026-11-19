import { redirect } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

// Aller sur /logout en tapant l'URL ne déconnecte pas : on renvoie à l'accueil
export const load: PageServerLoad = () => redirect(302, '/');

export const actions: Actions = {
	default: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(302, '/login');
	}
};
