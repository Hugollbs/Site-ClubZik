// Postgres renvoie les colonnes date et time sous forme de texte ('2026-09-01', '18:00:00').
// On les reformate à la main plutôt qu'avec Date, pour éviter tout décalage de fuseau horaire.

// '2026-09-01' -> '01/09/2026'
export function formatDate(isoDate: string): string {
	const [year, month, day] = isoDate.split('-');
	return `${day}/${month}/${year}`;
}

// '18:00:00' -> '18h', '18:30:00' -> '18h30'
export function formatTime(time: string): string {
	const [hours, minutes] = time.split(':');
	return minutes === '00' ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}
