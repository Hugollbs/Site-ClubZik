# PROGRESS

Référence des fonctionnalités : `FONCTIONNALITES.md` (IDs AUTH, RESA, ADM…).

**Objectif court terme : atteindre le « socle »**, c'est-à-dire un projet que les autres devs peuvent prendre pour développer chacun leurs pages séparément, sans toucher à l'auth, à la base ni au layout.

## Fait
- **Initialisation du projet SvelteKit + README** : base du site, générée avec `sv create`.
- **Configuration de Drizzle** : choix d'un ORM pour parler à la base.
- **Postgres via Docker Compose** : base locale reproductible. Les identifiants viennent du `.env`.
- **Cahier des charges** : `FONCTIONNALITES.md`, avec priorités P1 à P3 et modèle de données (DATA-01 à DATA-05).
- **Décision auth** : comptes gérés par ClubZik, sans adresse e-mail réelle. L'usage de l'identifiant INP-net est seulement conseillé. Validation de chaque nouveau compte par un admin.
- **Décision e-mail** : plugin `username` de Better Auth + adresse factice générée automatiquement (Better Auth impose un e-mail). Invisible pour l'utilisateur.
- **Décision organisation ** : organisation par route. Pages dans `src/routes/<page>/`, logique serveur commune dans `src/lib/server/<domaine>.ts`. Un dev = un dossier.

- **Décision admin** : on ne devient admin que promu par un autre admin (`isStaff` est en `input: false`, aucune requête cliente ne peut le fixer). Le tout premier admin vient d'un script lancé à la main sur le serveur (`npm run admin:promote -- <username>`), sans compte ni mot de passe par défaut.
- **Brique 1 du socle : schéma de la base** : tables `user` (+ `username`, `firstName`, `lastName`, `isApproved`, `isStaff`), `band`, `band_member`, `booking`, `regular_booking`, `visit`. Titulaire d'une réservation = `userId` ou `bandId`, exactement un des deux (CHECK). Types : `rehearsal`, `jam`, `concert`, `course`, `other`.
- **Docker Desktop installé, base Postgres lancée**, `npm run db:push` appliqué.
- **Anti-chevauchement des réservations (RESA-11)** : contrainte Postgres `EXCLUDE` dans `db/extra-constraints.sql`, à appliquer avec `npm run db:constraints` après `db:push` (script rejouable).

## En cours
- Brique 2 du socle : authentification (inscription, connexion, déconnexion).

## À faire : le socle (dans l'ordre)
1. ~~Schéma de données + `db:push` + contrainte anti-chevauchement~~ : fait.
2. Auth : inscription, connexion, déconnexion (AUTH-01, AUTH-02, AUTH-03, AUTH-09), avec génération de l'adresse factice.
3. Script `npm run admin:promote -- <username>` : met `isStaff` et `isApproved` à vrai pour un compte inscrit via `/register`. Sert aussi à récupérer l'accès si tous les admins sont perdus. Remplace l'ancien « seed d'un compte admin ».
4. Gardes d'accès centralisés (hooks) : non connecté → `/login`, compte non approuvé → page « en attente » (AUTH-07), `/admin-params` réservé aux admins (ADM-01).
5. Layout commun : barre latérale (UI-01), dates en français (UI-04).
6. Pages squelettes vides : `/booking`, `/profile`, `/bands`, `/events`, `/admin-params`, un dossier par route.
7. Hygiène : supprimer `src/routes/demo/` et `src/lib/vitest-examples/`, vrai README (installation : `docker compose up -d`, `db:push`, puis `db:constraints`, dans cet ordre), règles de contribution (branches, PR), `npm run check` et `npm run lint` qui passent.

## À faire : ensuite, par les devs de pages (P1 d'abord)
- ADM-02, ADM-04 : validation des nouveaux membres et promotion en admin (contrôle côté serveur, voir règles dans ADM-04).
- RESA-01 à RESA-08, RESA-10, RESA-11 : planning, réservation, modification, suppression, pas de chevauchement.
- ADM-07, ADM-08 : créneaux réguliers.
- Puis les P2 (profils, groupes, gestion des membres, réinitialisation du mot de passe par un admin, mobile), puis les P3.


