import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Pages accessibles sans être connecté (route IDs pour le matching)
const PUBLIC_ROUTES = ['/(public)', '/(public)/login', '/(public)/register'];
// Pages accessibles connecté mais pas encore approuvé
const PENDING_ROUTES = ['/(public)/pending', '/(public)/logout'];
// Pages réservées aux admins
const ADMIN_ROUTES = ['/(app)/admin-params'];

const startsWithAny = (routeId: string, prefixes: string[]) =>
	prefixes.some((prefix) => routeId === prefix || routeId.startsWith(prefix + '/'));

// Règles d'accès centralisées : à appeler depuis hooks.server.ts, jamais dans les pages.
// On se base sur route.id (la route SvelteKit, sans préfixe de langue) et non sur l'URL,
// pour qu'un préfixe /es/ ne contourne pas les règles.
export function checkAccess(event: RequestEvent) {
	const routeId = event.route.id;
	// Route inconnue : SvelteKit affichera sa 404
	console.log('🛡️ checkAccess routeId:', routeId);
	if (!routeId) return;

	const user = event.locals.user;

	if (!user) {
		if (startsWithAny(routeId, PUBLIC_ROUTES)) return;
		redirect(303, '/login');  // ← URL réelle
	}

	if (!user.isApproved) {
		if (startsWithAny(routeId, PENDING_ROUTES)) return;
		redirect(303, '/pending');  // ← URL réelle
	}

	// Approuvé : plus de raison de rester sur la page d'attente
	if (routeId === '/(public)/pending') redirect(303, '/');  // ← URL réelle

	if (startsWithAny(routeId, ADMIN_ROUTES) && !user.isStaff) {
		error(403, 'Réservé aux administrateurs.');
	}
}