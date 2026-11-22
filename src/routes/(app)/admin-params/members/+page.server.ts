import { fail } from '@sveltejs/kit';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { user } from '#lib/server/db/auth.schema.ts';
import type { Actions, PageServerLoad } from './$types';

// Dans un LIKE, % et _ sont des jokers : on les échappe pour chercher le texte tel quel
function escapeLike(text: string) {
	return text.replace(/[\\%_]/g, '\\$&');
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const search = url.searchParams.get('q')?.trim() ?? '';
	const pattern = `%${escapeLike(search)}%`;

	const pendingMembers = await db
		.select({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username
		})
		.from(user)
		.where(eq(user.isApproved, false))
		.orderBy(asc(user.createdAt));

	const members = await db
		.select({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			isApproved: user.isApproved,
			isStaff: user.isStaff
		})
		.from(user)
		.where(
			search
				? or(
						ilike(user.firstName, pattern),
						ilike(user.lastName, pattern),
						ilike(user.username, pattern)
					)
				: undefined
		)
		.orderBy(asc(user.lastName), asc(user.firstName));

	return { pendingMembers, members, search, currentUserId: locals.user?.id };
};

async function readMemberId(request: Request) {
	const formData = await request.formData();
	return formData.get('id')?.toString() ?? '';
}

export const actions: Actions = {
	accept: async ({ request }) => {
		const id = await readMemberId(request);
		if (!id) return fail(400, { message: 'Membre manquant.' });

		// La condition isApproved = false garantit qu'on ne touche qu'à un compte en attente
		const updated = await db
			.update(user)
			.set({ isApproved: true })
			.where(and(eq(user.id, id), eq(user.isApproved, false)))
			.returning({ id: user.id });

		if (updated.length === 0) {
			return fail(404, { message: "Ce membre n'existe plus ou est déjà validé." });
		}
	},

	reject: async ({ request }) => {
		const id = await readMemberId(request);
		if (!id) return fail(400, { message: 'Membre manquant.' });

		// Même condition : un POST forgé ne doit jamais pouvoir supprimer un membre déjà validé
		// (la suppression d'un membre validé relève d'ADM-05, avec ses propres règles)
		const deleted = await db
			.delete(user)
			.where(and(eq(user.id, id), eq(user.isApproved, false)))
			.returning({ id: user.id });

		if (deleted.length === 0) {
			return fail(404, { message: "Ce membre n'existe plus ou est déjà validé." });
		}
	}
};
