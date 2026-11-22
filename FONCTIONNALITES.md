# Fonctionnalités à implémenter — reproduction de zik.inpt.fr

## Nomenclature

| ID     |                            |
| ------ | -------------------------- |
| `AUTH` | Authentification et compte |
| `RESA` | Planning et réservations   |
| `PROF` | Profils utilisateurs       |
| `GRP`  | Groupes (bands)            |
| `EVT`  | Événements                 |
| `ADM`  | Administration             |
| `UI`   | Interface et transverse    |
| `DATA` | Modèle de données          |

Colonnes :

- **Priorité** : `P1` indispensable pour une première version, `P2` important, `P3` secondaire.
- **Rôle** : `Anonyme` (non connecté), `Membre` (connecté et vérifié), `Admin` (`is_staff`).
- **Endpoint API d'origine** : l'API REST de l'ancien site, donnée uniquement comme référence du comportement. Le nouveau site est en SvelteKit avec Better Auth : il n'y a pas d'API REST à reproduire, la logique passe par les `load`, les actions de formulaire et `src/lib/server/`.

## Avancement (2026-11-17)

Pages métier : toutes sont encore des squelettes vides, sauf l'authentification.

| Statut        | IDs                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Fait          | AUTH-01, AUTH-02, AUTH-03, AUTH-07, AUTH-09, ADM-01 à ADM-05, ADM-07, ADM-08, ADM-10, RESA-11, UI-01, DATA-01 à DATA-05 |
| Partiel       | RESA-10 (le chevauchement est bloqué en base ; règle « supprimer seulement ses créneaux » à faire) ; ADM-09 (suppression faite, modification d'un créneau régulier pas faite) ; UI-04 (fonctions `formatDate` / `formatTime` en place, utilisées par la page admin seulement) |
| Abandonné     | ADM-06 (création d'un compte par un admin) : décision du 2026-11-22, les membres s'inscrivent eux-mêmes et l'admin les valide |
| À faire       | tous les autres |

UI-04 (dates en français) n'est pas fait : aucune date n'est encore affichée.

---

## AUTH — Authentification et compte

| ID      | Fonctionnalité                                                                                                                                                                               | Route front           | Endpoint API d'origine                   | Rôle               | Priorité |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------- | ------------------ | -------- |
| AUTH-01 | Connexion avec identifiant ClubZik + mot de passe (l'identifiant INP-net est conseillé, pas obligatoire)                                                                                     | `/` (si non connecté) | `POST rest-auth/login/`                  | Anonyme            | P1       |
| AUTH-02 | Déconnexion                                                                                                                                                                                  | barre latérale        | `POST rest-auth/logout/`                 | Membre             | P1       |
| AUTH-03 | Récupération de l'utilisateur connecté, jeton dans l'en-tête `Authorization`                                                                                                                 | —                     | `GET rest-auth/user/`                    | Membre             | P1       |
| AUTH-04 | Réinitialisation du mot de passe par un admin, sans e-mail : l'admin fixe un mot de passe temporaire pour un membre                                                                          | `/admin-params`       | `POST rest-auth/password/reset/`         | Admin              | P2       |
| AUTH-05 | Après une réinitialisation, le membre change le mot de passe temporaire depuis ses paramètres (voir AUTH-06)                                                                                 | `/user-params`        | `POST rest-auth/password/reset/confirm/` | Membre             | P2       |
| AUTH-06 | Changement de mot de passe : ancien, nouveau, confirmation ; 8 caractères minimum                                                                                                            | `/user-params`        | `POST rest-auth/password/change/`        | Membre             | P2       |
| AUTH-07 | Compte en attente : écran « Vérification du compte en cours » tant qu'un admin n'a pas validé                                                                                                | `/`                   | `GET users/requestUserVerif/`            | Membre non vérifié | P1       |
| AUTH-08 | Enregistrement des visites                                                                                                                                                                   | —                     | `GET users/registerVisit/`               | Membre             | P3       |
| AUTH-09 | Inscription d'un visiteur : identifiant (utiliser son login INP-net est conseillé), prénom, nom, mot de passe, sans adresse e-mail ; le compte est créé non vérifié (voir AUTH-07 et ADM-02) | `/register`           | `POST rest-auth/registration/`           | Anonyme            | P1       |

Messages d'erreur à reproduire (AUTH-06) : mot de passe vide, ancien mot de passe manquant, moins de 8 caractères, confirmation différente, succès du changement.

## RESA — Planning et réservations

| ID      | Fonctionnalité                                                                                                                  | Route front     | Endpoint API d'origine                  | Rôle                  | Priorité |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------- | --------------------- | -------- |
| RESA-01 | Liste des créneaux en cartes : date, heure début–fin, type, responsable                                                         | `/`, `/booking` | `GET bookings/`                         | Membre                | P1       |
| RESA-02 | Navigation « Créneaux précédents » / « Créneaux suivants »                                                                      | `/booking`      | `GET bookings/` (paramètres de période) | Membre                | P1       |
| RESA-03 | Créneaux de durée variable (1 h, 45 min, 30 min), plage de 8 h à 21 h 30                                                        | `/booking`      | —                                       | Membre                | P1       |
| RESA-04 | Créneau libre affiché « Libre » avec bouton « Réserver »                                                                        | `/booking`      | —                                       | Membre                | P1       |
| RESA-05 | Formulaire de réservation : type et titulaire                                                                                   | `/booking`      | `POST bookings/`                        | Membre                | P1       |
| RESA-06 | Types de réservation : `rehearsal` (Répétition), `jam`, `concert`, `course` (Cours), `other` (Autre)                            | —               | —                                       | —                     | P1       |
| RESA-07 | Modification de sa réservation                                                                                                  | `/booking`      | `PUT bookings/{id}/`                    | Membre (propriétaire) | P1       |
| RESA-08 | Suppression de sa réservation                                                                                                   | `/booking`      | `DELETE bookings/{id}/`                 | Membre (propriétaire) | P1       |
| RESA-09 | Lien du responsable d'un créneau vers son profil                                                                                | `/booking`      | —                                       | Membre                | P2       |
| RESA-10 | Un utilisateur ne peux supprimer que les créneaux qu'il a lui même réservés, limite de créneaux par personne ? , chevauchements | —               | —                                       | —                     | P1       |
| RESA-11 | pas de chevauchements de créneaux possibles                                                                                     | —               | —                                       | —                     | P1       |

## PROF — Profils

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |
|---|---|---|---|---|---|---|
| PROF-01 | Son propre profil | `/profile` | `GET users/{id}/` | Membre | P2 |
| PROF-02 | Profil d'un autre membre | `/profile/:profileId` | `GET users/{id}/` | Membre | P2 |
| PROF-03 | En-tête de profil : photo et nom | `/profile/...` | — | Membre | P2 |
| PROF-04 | Liste des groupes du membre, avec un lien vers chacun ; sinon « Aucun groupe pour le moment » | `/profile/...` | — | Membre | P2 |
| PROF-05 | Photo de profil propre à chaque membre | — | — | Membre | P3 |

## GRP — Groupes

| ID     | Fonctionnalité                                                                                    | Route front     | Endpoint API d'origine      | Rôle                     | Priorité |
| ------ | ------------------------------------------------------------------------------------------------- | --------------- | --------------------------- | ------------------------ | -------- |
| GRP-01 | Liste des groupes                                                                                 | `/bands`        | `GET bands/`                | Membre                   | P2       |
| GRP-02 | Création d'un groupe : nom obligatoire, description facultative                                   | `/bands`        | `POST bands/`               | Membre                   | P2       |
| GRP-03 | Page d'un groupe : nom, description, membres ; « Groupe non trouvé » si l'identifiant est inconnu | `/band/:bandId` | `GET bands/{id}/`           | Membre                   | P2       |
| GRP-04 | Recherche d'un membre à ajouter (« Aucun utilisateur trouvé » si rien)                            | `/band/:bandId` | `GET users/search/`         | Membre                   | P2       |
| GRP-05 | Ajout et retrait de membres                                                                       | `/band/:bandId` | `PUT bands/{id}/`           | Membre du groupe         | P2       |
| GRP-06 | Modification et suppression d'un groupe                                                           | `/band/:bandId` | `PUT`, `DELETE bands/{id}/` | Membre du groupe / Admin | P3       |

## EVT — Événements

| ID     | Fonctionnalité      | Route front | Endpoint API d'origine | Rôle   | Priorité |
| ------ | ------------------- | ----------- | ---------------------- | ------ | -------- |
| EVT-01 | Page des événements | `/events`   | -                      | Membre | P3       |

## ADM — Administration

| ID     | Fonctionnalité                                                                                                                                                                                                                                                                                                     | Route front     | Endpoint API d'origine                                | Rôle  | Priorité |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------- | ----- | -------- |
| ADM-01 | Accès à la page d'administration réservé aux admins                                                                                                                                                                                                                                                                | `/admin-params` | —                                                     | Admin | P1       |
| ADM-02 | « Nouveaux membres à vérifier » : accepter ou refuser                                                                                                                                                                                                                                                              | `/admin-params` | `POST users/respondUserVerif/{id}/`                   | Admin | P1       |
| ADM-03 | « Liste des membres » avec recherche ; colonnes Utilisateur, Admin, Vérif, Actions                                                                                                                                                                                                                                 | `/admin-params` | `GET users/full/`, `GET users/search/`                | Admin | P2       |
| ADM-04 | Modification d'un membre : nom d'utilisateur, prénom, nom, admin oui/non (sans e-mail). Promouvoir un membre en admin est la seule façon de devenir admin. Règles, vérifiées côté serveur : seul un admin peut promouvoir ; le compte doit être approuvé ; un admin ne peut pas se rétrograder s'il est le dernier | `/admin-params` | `PUT users/{id}/`                                     | Admin | P1       |
| ADM-05 | Suppression d'un membre                                                                                                                                                                                                                                                                                            | `/admin-params` | `DELETE users/{id}/`                                  | Admin | P2       |
| ADM-06 | Création d'un compte : nom d'utilisateur, prénom, nom, mot de passe, admin oui/non (compte créé déjà approuvé, sans e-mail)                                                                                                                                                                                        | `/admin-params` | `POST rest-auth/registration/` puis `PUT users/{id}/` | Admin | P2       |
| ADM-07 | Ajout d'un créneau régulier : jour, créneau, type, responsable (utilisateur ou groupe), début et fin de période                                                                                                                                                                                                    | `/admin-params` | `POST bookings/regular/`                              | Admin | P1       |
| ADM-08 | « Liste des créneaux réguliers » : colonnes Type, Responsable, Jour, Créneau, Période, Actions                                                                                                                                                                                                                     | `/admin-params` | `GET bookings/regular/`                               | Admin | P1       |
| ADM-09 | Modification et suppression d'un créneau régulier                                                                                                                                                                                                                                                                  | `/admin-params` | `PUT`, `DELETE bookings/regular/{id}/`                | Admin | P2       |
| ADM-10 | Recherche du responsable d'un créneau régulier parmi les utilisateurs et les groupes                                                                                                                                                                                                                               | `/admin-params` | `GET users/search/`, `GET bands/`                     | Admin | P2       |

## UI — Interface et transverse

| ID    | Fonctionnalité                                                                                          | Priorité |
| ----- | ------------------------------------------------------------------------------------------------------- | -------- |
| UI-01 | Barre latérale fixe : logo, Profil, Réservations, Paramètres, Admin (visible seulement pour les admins) | P1       |
| UI-02 | Avatar de l'utilisateur en haut à droite                                                                | P3       |
| UI-03 | Écran de chargement avec le logo du club                                                                | P3       |
| UI-04 | Dates en français (jours et mois, formes longues et abrégées)                                           | P1       |
| UI-05 | Affichage correct sur mobile                                                                            | P2       |

## DATA — Modèle de données ( copié de l'ancien code source)

| ID      | Entité           | Champs principaux                                                                                                                                               | Statut (schéma en base) |
| ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| DATA-01 | `User`           | `username`, `first_name`, `last_name`, `is_staff`, `is_approved`, mot de passe ; pas d'e-mail réel (adresse factice interne imposée par Better Auth, invisible) | Fait |
| DATA-02 | `Band`           | `name`, `description`, `members` (n–n vers `User`)                                                                                                              | Fait |
| DATA-03 | `Booking`        | `start`, `end`, `type` (voir RESA-06), titulaire : `user` ou `band`                                                                                             | Fait |
| DATA-04 | `RegularBooking` | `day` (jour de la semaine), créneau horaire, `type`, responsable `user` ou `band`, début et fin de période                                                      | Fait |
| DATA-05 | `Visit`          | utilisateur, date                                                                                                                                               | Fait |

---
