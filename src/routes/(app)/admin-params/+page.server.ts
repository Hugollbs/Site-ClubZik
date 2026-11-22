import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';

// /admin-params seul n'a pas de contenu : on envoie vers le premier onglet
export const load: PageServerLoad = () => {
	redirect(303, resolve('/(app)/admin-params/members'));
};
