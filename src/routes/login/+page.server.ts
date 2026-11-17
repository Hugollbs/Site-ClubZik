import { fail, redirect } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';
import { authErrorMessage } from '#lib/server/auth-errors.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	// Déjà connecté : inutile de se reconnecter
	if (event.locals.user) redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!username || !password) {
			return fail(400, { message: 'Identifiant et mot de passe obligatoires.', username });
		}

		try {
			await auth.api.signInUsername({ body: { username, password } });
		} catch (error) {
			return fail(400, {
				message: authErrorMessage(error, 'Connexion impossible, réessaie plus tard.'),
				username
			});
		}

		redirect(302, '/');
	}
};
