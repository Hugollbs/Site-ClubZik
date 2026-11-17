import { APIError } from 'better-auth/api';

// Codes d'erreur Better Auth -> messages français affichés à l'utilisateur
const MESSAGES: Record<string, string> = {
	INVALID_USERNAME_OR_PASSWORD: 'Identifiant ou mot de passe incorrect.',
	USERNAME_IS_ALREADY_TAKEN: 'Cet identifiant est déjà pris.',
	PASSWORD_TOO_SHORT: 'Le mot de passe est trop court (8 caractères minimum).'
};

export function authErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof APIError) {
		const code = error.body?.code;
		if (typeof code === 'string' && code in MESSAGES) return MESSAGES[code];
	}
	return fallback;
}
