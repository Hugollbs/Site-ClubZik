// Libellés français partagés entre le serveur (validation) et les pages (affichage).

// L'indice dans le tableau = day_of_week en base (0 = lundi … 6 = dimanche)
export const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Clés = valeurs de l'enum booking_type en base
export const BOOKING_TYPE_LABELS: Record<string, string> = {
	rehearsal: 'Répétition',
	jam: 'Jam',
	concert: 'Concert',
	course: 'Cours',
	other: 'Autre'
};
