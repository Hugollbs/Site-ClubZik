import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// On n'envoie au navigateur que ce dont le layout a besoin (jamais l'objet user complet)
export const load: LayoutServerLoad = ({ locals, url }) => {
	const user = locals.user;
	
	 // Redirect si user connecté ET sur la page d'accueil "/"
  if (user && url.pathname === '/') {
    redirect(302, '/booking');
  }

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
