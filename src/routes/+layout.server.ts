import type { LayoutServerLoad } from './$types';

// On n'envoie au navigateur que ce dont le layout a besoin (jamais l'objet user complet)
export const load: LayoutServerLoad = (event) => {
	const user = event.locals.user;
	return {
		user: user
			? {
					displayName: user.displayUsername ?? user.username ?? user.name,
					isApproved: user.isApproved,
					isStaff: user.isStaff
				}
			: null
	};
};
