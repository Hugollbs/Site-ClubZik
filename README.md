# ClubZik — site du club de musique de l'ENSEEIHT

Ce projet vise à **recréer le site du ClubZik**.
Le périmètre à reproduire est décrit dans [FONCTIONNALITES.md](FONCTIONNALITES.md) :
chaque fonctionnalité y a un identifiant (`AUTH-01`, `RESA-05`, `ADM-07`…),
un rôle et une priorité (P1 indispensable, P2 important, P3 secondaire).

## Fonctionnalités visées

- **AUTH** : connexion avec le login INP-net, réinitialisation et changement de mot de passe, validation des comptes par un admin
- **RESA** : planning et réservation de créneaux de répétition
- **PROF** : profils des membres
- **GRP** : groupes (bands)
- **EVT** : événements
- **ADM** : administration (membres, créneaux réguliers)
- **UI** : interface (barre latérale, dates en français, affichage mobile)

La première version couvre les fonctionnalités P1.

## Stack

SvelteKit (Svelte 5) + TypeScript + Vite

## Lancer le projet

```sh
npm install
npm run dev
```

Autres commandes : `npm run build` (build de production), `npm run preview` (aperçu du build), `npm run check` (vérification des types).
