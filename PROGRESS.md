# PROGRESS

Référence des fonctionnalités : `FONCTIONNALITES.md` (IDs AUTH, RESA, ADM…).

## Fait
- **Initialisation du projet SvelteKit + README** : base du site, générée avec `sv create`.
- **Configuration de Drizzle** : choix d'un ORM pour parler à la base.
- **Postgres via Docker Compose** : base locale reproductible. Les identifiants viennent du `.env`.
- **Cahier des charges** : `FONCTIONNALITES.md`, avec priorités P1 à P3 et modèle de données (DATA-01 à DATA-05).

## En cours
- Schéma de la base (`src/lib/server/db/schema.ts`) : `User`, `Band`, `Booking`, `RegularBooking`, `Visit`.

## À faire (par priorité, P1 d'abord)
1. Schéma de données + `npm run db:push`.
2. AUTH-01 à AUTH-03, AUTH-07 : connexion, déconnexion, compte en attente de vérification.
3. ADM-01, ADM-02 : page admin protégée, validation des nouveaux membres.
4. RESA-01 à RESA-08, RESA-10, RESA-11 : liste des créneaux, réservation, modification, suppression, pas de chevauchement.
5. ADM-07, ADM-08 : créneaux réguliers.
6. UI-01, UI-04 : barre latérale, dates en français.
7. Ensuite les P2 (profils, groupes, gestion des membres, mobile), puis les P3.
8. Nettoyer les exemples générés (`src/routes/demo/`, `src/lib/vitest-examples/`) et remplacer le README.

## Questions ouvertes
- Connexion INP-net (AUTH-01) : on la garde ou on utilise un compte propre au site (e-mail + mot de passe, Better Auth) ?
- Limite de créneaux par personne (RESA-10) : oui ou non, et combien ?
- Langues : le site doit être en français (UI-04). Paraglide est configuré en `en` et `es`, donc faut-il le garder ou le retirer ?
- Les outils installés par défaut (Storybook, mdsvex, enhanced-img) : on les garde ?
- Hébergement : à décider.
