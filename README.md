# ClubZik

Site du club de musique de l'ENSEEIHT : planning des salles, comptes, groupes, administration.
Reproduction de zik.inpt.fr. La liste des fonctionnalités et leurs identifiants (RESA-01, ADM-02…) est dans `FONCTIONNALITES.md`, l'avancement dans `PROGRESS.md`.

Stack : SvelteKit (Svelte 5), TypeScript, Tailwind 4, PostgreSQL (Docker) + Drizzle ORM, Better Auth.

## Installation

Prérequis : Node.js (version récente) et Docker.

```sh
npm install
# Créer un fichier .env (jamais commité) avec : DATABASE_URL, ORIGIN, BETTER_AUTH_SECRET,
# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB (demander les valeurs de dev à un mainteneur)

docker compose up -d       # 1. lance Postgres
npm run db:push            # 2. crée les tables
npm run db:constraints     # 3. ajoute la contrainte anti-chevauchement (dans cet ordre, après db:push)
npm run dev                # lance le site
```

### Premier admin

On ne devient admin que promu par un autre admin. Pour le tout premier : s'inscrire sur `/register`, puis

```sh
npm run admin:promote -- <identifiant>
```

Le même script sert à récupérer l'accès si tous les admins sont perdus.

## Architecture : un dev = un dossier

- `src/routes/<page>/` : une page = un dossier. `+page.svelte` est la vue, `+page.server.ts` est le code serveur (chargement des données, actions de formulaire).
- `src/lib/server/<domaine>.ts` : logique serveur partagée (réservations, groupes…).
- `src/lib/server/db/schema.ts` : tables de la base. `auth.schema.ts` est généré (`npm run auth:schema`), ne jamais l'éditer à la main.
- `src/routes/+layout.svelte` : cadre commun (barre latérale). Ne pas le dupliquer dans les pages.

Pages squelettes déjà créées : `/booking`, `/bands`, `/events`, `/profile`, `/admin-params`. Chacune est à remplir sans toucher aux autres.

### Règles d'accès (ne pas les refaire dans les pages)

Elles sont centralisées dans `src/lib/server/guards.ts`, appelé par `src/hooks.server.ts` :

- non connecté : seules `/login` et `/register` sont accessibles ;
- connecté mais non approuvé : redirigé vers `/pending` ;
- `/admin-params` : réservé aux admins (403 sinon).

Dans une page serveur, `event.locals.user` contient l'utilisateur connecté (avec `isApproved` et `isStaff`). Pour une nouvelle page publique ou réservée, on ajoute la route dans les listes de `guards.ts`.

## Conventions

- Identifiants de code en anglais, commentaires en français, courts, qui expliquent le pourquoi.
- Vérifications côté serveur obligatoires (droits, validation) : ne jamais faire confiance au navigateur.
- Pas de nouvelle dépendance sans en discuter.

## Contribuer

1. Une branche par fonctionnalité, nommée d'après l'identifiant : `resa-01-planning`, `adm-02-validation-membres`. Jamais de commit direct sur `main`.
2. Petits commits, message en français à l'impératif (ex. « Ajoute la page événements »).
3. Avant d'ouvrir la demande de fusion : `npm run check` doit passer.
4. Demande de fusion (merge request) vers `main`, relue par quelqu'un d'autre avant fusion.
5. Pas de réécriture d'historique sur une branche partagée.

## Commandes utiles

| Commande                        | Rôle                             |
| ------------------------------- | -------------------------------- |
| `npm run dev`                   | serveur de développement         |
| `npm run check`                 | vérification des types           |
| `npm run format`                | mise en forme (Prettier)         |
| `npm run db:studio`             | interface pour consulter la base |
| `npm run db:push`               | applique le schéma à la base     |
| `npm run admin:promote -- <id>` | promeut un compte en admin       |
