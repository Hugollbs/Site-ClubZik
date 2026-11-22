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

- **Brique 2 : authentification** : inscription, connexion, déconnexion, messages d'erreur en français.
- **Briques 3 à 6** : script `admin:promote`, gardes d'accès centralisés (`src/lib/server/guards.ts`), layout avec barre latérale, page d'attente `/pending`, pages squelettes, README avec règles de contribution.

## État actuel (bilan du 2026-11-17)

**Le socle est atteint**, sous réserve de la dernière vérification ci-dessous. Toutes les pages métier sont encore des squelettes (2 lignes) : `/booking`, `/profile`, `/bands`, `/events`, `/admin-params` et `/`.

Fonctionnalités réellement en place (IDs de `FONCTIONNALITES.md`) : AUTH-01, AUTH-02, AUTH-03, AUTH-07, AUTH-09, ADM-01, RESA-11 (contrainte en base), UI-01 (barre latérale, lien Admin réservé aux admins) et DATA-01 à DATA-05 (schéma).

Pas encore fait malgré ce que laissait croire une ancienne version de ce fichier :
- **UI-04 (dates en français)** : aucune mise en forme de date dans le code pour l'instant.
- **Paraglide (`messages/en.json`, `es.json`)** : seulement le scaffold d'origine (`hello_world`), les locales sont `en` et `es`, pas `fr`. Les textes du site sont écrits en dur en français.

## Page admin (bilan du 2026-11-22)

Faite, sur la branche `feature/admin-mmeberes`, dans `src/routes/(app)/admin-params/` : onglets Membres / Créneaux réguliers, validation des nouveaux membres, liste avec recherche, modification (règles ADM-04 vérifiées côté serveur), suppression avec confirmation, créneaux réguliers (ajout, liste, suppression, refus des chevauchements).

- **Décision** : l'admin ne crée pas de compte (ADM-06 abandonné), les membres s'inscrivent et l'admin les valide. « Refuser » un nouveau membre supprime son compte.
- **Décision** : les créneaux réguliers ont des heures de début et de fin libres (les jams durent de 12h à 14h), pas des tranches d'une heure.
- **À savoir** : `resolve()` demande l'identifiant de route avec son groupe (`'/(app)/admin-params/members'`).
- **Pas fait** : modification d'un créneau régulier (ADM-09), règle « dernier admin non rétrogradable » testée seulement par lecture du code (un seul admin en base de test).

## En cours

- Dernière vérification de la brique 7 : lancer `npm run check` et `npm run lint` et corriger ce qui échoue (non vérifié à ce jour). Le reste de la brique est fait (`demo/` et `vitest-examples/` supprimés, README, règles de contribution, Prettier).

## Le socle (dans l'ordre)

1. ~~Schéma de données + `db:push` + contrainte anti-chevauchement~~ : fait.
2. ~~Auth : inscription, connexion, déconnexion (AUTH-01, AUTH-02, AUTH-03, AUTH-09), avec génération de l'adresse factice~~ : fait.
3. ~~Script `npm run admin:promote -- <username>`~~ : fait. Met `isStaff` et `isApproved` à vrai pour un compte inscrit via `/register`. Sert aussi à récupérer l'accès si tous les admins sont perdus.
4. ~~Gardes d'accès centralisés (hooks)~~ : fait. Non connecté → `/login`, compte non approuvé → `/pending` (AUTH-07), `/admin-params` réservé aux admins (ADM-01).
5. Layout commun : barre latérale (UI-01) fait ; **dates en français (UI-04) pas fait**, à traiter quand la première page affichera des dates (RESA-01).
6. ~~Pages squelettes vides~~ : fait.
7. Hygiène : tout est fait sauf `npm run check` et `npm run lint` à passer.

## À faire : ensuite, par les devs de pages (P1 d'abord)

- ADM-02, ADM-04 : validation des nouveaux membres et promotion en admin (contrôle côté serveur, voir règles dans ADM-04).
- RESA-01 à RESA-08, RESA-10, RESA-11 : planning, réservation, modification, suppression, pas de chevauchement.
- ADM-07, ADM-08 : créneaux réguliers.
- Puis les P2 (profils, groupes, gestion des membres, réinitialisation du mot de passe par un admin, mobile), puis les P3.
