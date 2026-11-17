import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

// Better Auth impose une adresse e-mail : on en fabrique une, jamais affichée ni utilisée.
// ".invalid" est un domaine réservé (RFC 2606) : aucun e-mail ne partira jamais vers lui.
const FAKE_EMAIL_DOMAIN = 'clubzik.invalid';

export const load: PageServerLoad = (event) => {
	// Déjà connecté : rien à faire ici
	if (event.locals.user) redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username')?.toString().trim() ?? '';
		const firstName = formData.get('firstName')?.toString().trim() ?? '';
		const lastName = formData.get('lastName')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const passwordConfirm = formData.get('passwordConfirm')?.toString() ?? '';

		// On renvoie les valeurs saisies (sauf les mots de passe) pour ne pas vider le formulaire
		const values = { username, firstName, lastName };

		if (!username || !firstName || !lastName || !password) {
			return fail(400, { message: 'Tous les champs sont obligatoires.', values });
		}
		if (password !== passwordConfirm) {
			return fail(400, { message: 'Les deux mots de passe sont différents.', values });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email: `${username.toLowerCase()}@${FAKE_EMAIL_DOMAIN}`,
					password,
					name: `${firstName} ${lastName}`,
					username,
					firstName,
					lastName
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || "L'inscription a échoué.", values });
			}
			return fail(500, { message: 'Erreur inattendue.', values });
		}

		// Le compte existe mais n'est pas approuvé : la page d'attente viendra avec les gardes d'accès
		redirect(302, '/');
	}
};
