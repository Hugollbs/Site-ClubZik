import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ne, count } from 'drizzle-orm';
import { resolve } from '$app/paths';
import { db } from '#lib/server/db/index.ts';
import { user } from '#lib/server/db/auth.schema.ts';
import type { Actions, PageServerLoad } from './$types';

// Mêmes règles que le plugin username de Better Auth à l'inscription (valeurs par défaut du plugin,
// à revérifier si on le configure un jour) : sinon l'admin pourrait créer un identifiant que
// personne ne pourrait plus saisir à la connexion.
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,30}$/;

async function findMember(id: string) {
	const [member] = await db
		.select({
			id: user.id,
			username: user.username,
			displayUsername: user.displayUsername,
			firstName: user.firstName,
			lastName: user.lastName,
			isApproved: user.isApproved,
			isStaff: user.isStaff
		})
		.from(user)
		.where(eq(user.id, id));
	return member;
}

export const load: PageServerLoad = async ({ params }) => {
	const member = await findMember(params.id);
	if (!member) error(404, 'Membre introuvable.');
	return { member };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const member = await findMember(params.id);
		if (!member) error(404, 'Membre introuvable.');

		const formData = await request.formData();
		const username = formData.get('username')?.toString().trim() ?? '';
		const firstName = formData.get('firstName')?.toString().trim() ?? '';
		const lastName = formData.get('lastName')?.toString().trim() ?? '';
		// Une case à cocher absente du formulaire = décochée
		const isStaff = formData.get('isStaff') !== null;

		// On renvoie les valeurs saisies pour ne pas vider le formulaire en cas d'erreur
		const values = { username, firstName, lastName, isStaff };

		if (!firstName || !lastName) {
			return fail(400, { message: 'Le prénom et le nom sont obligatoires.', values });
		}
		if (!USERNAME_PATTERN.test(username)) {
			return fail(400, {
				message: "L'identifiant doit faire 3 à 30 caractères : lettres, chiffres, _ ou .",
				values
			});
		}

		// Better Auth stocke l'identifiant en minuscules (username) et garde la saisie dans displayUsername
		const normalizedUsername = username.toLowerCase();
		const [taken] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.username, normalizedUsername), ne(user.id, member.id)));
		if (taken) {
			return fail(400, { message: 'Cet identifiant est déjà pris.', values });
		}

		// ADM-04 : seul un compte approuvé peut devenir admin
		if (isStaff && !member.isApproved) {
			return fail(400, {
				message: "Ce compte n'est pas encore validé : accepte-le avant de le promouvoir.",
				values
			});
		}

		// ADM-04 : on ne peut pas retirer le dernier admin (sinon plus personne ne gère le site)
		if (member.isStaff && !isStaff) {
			const [{ total }] = await db
				.select({ total: count() })
				.from(user)
				.where(eq(user.isStaff, true));
			if (total <= 1) {
				return fail(400, {
					message: "C'est le dernier administrateur : il ne peut pas être rétrogradé.",
					values
				});
			}
		}

		await db
			.update(user)
			.set({
				username: normalizedUsername,
				displayUsername: username,
				firstName,
				lastName,
				name: `${firstName} ${lastName}`,
				isStaff
			})
			.where(eq(user.id, member.id));

		redirect(303, resolve('/(app)/admin-params/members'));
	}
};
