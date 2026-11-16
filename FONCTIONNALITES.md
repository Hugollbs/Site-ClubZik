# Fonctionnalités à implémenter — reproduction de zik.inpt.fr

## Nomenclature

|ID | |
|---|---|
| `AUTH` | Authentification et compte |
| `RESA` | Planning et réservations |
| `PROF` | Profils utilisateurs |
| `GRP`  | Groupes (bands) |
| `EVT`  | Événements |
| `ADM`  | Administration |
| `UI`   | Interface et transverse |
| `DATA` | Modèle de données |


Colonnes :

- **Priorité** : `P1` indispensable pour une première version, `P2` important, `P3` secondaire.
- **Rôle** : `Anonyme` (non connecté), `Membre` (connecté et vérifié), `Admin` (`is_staff`).


---

## AUTH — Authentification et compte

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |  
|---|---|---|---|---|---|
| AUTH-01 | Connexion avec login INP-net + mot de passe | `/` (si non connecté) | `POST rest-auth/login/` | Anonyme | P1 | 
| AUTH-02 | Déconnexion | barre latérale | `POST rest-auth/logout/` | Membre | P1 |
| AUTH-03 | Récupération de l'utilisateur connecté, jeton dans l'en-tête `Authorization` | — | `GET rest-auth/user/` | Membre | P1 |
| AUTH-04 | Demande de réinitialisation du mot de passe par e-mail | `/forgottenPassword/` | `POST rest-auth/password/reset/` | Anonyme | P2 |
| AUTH-05 | Saisie du nouveau mot de passe depuis le lien reçu (`uid`, `token`) | `/resetPassword` | `POST rest-auth/password/reset/confirm/` | Anonyme | P2 |
| AUTH-06 | Changement de mot de passe : ancien, nouveau, confirmation ; 8 caractères minimum | `/user-params` | `POST rest-auth/password/change/` | Membre | P2 |
| AUTH-07 | Compte en attente : écran « Vérification du compte en cours » tant qu'un admin n'a pas validé | `/` | `GET users/requestUserVerif/` | Membre non vérifié | P1 |
| AUTH-08 | Enregistrement des visites | — | `GET users/registerVisit/` | Membre | P3 |

Messages d'erreur à reproduire (AUTH-04 à AUTH-06) : mot de passe vide, ancien mot de passe manquant, moins de 8 caractères, confirmation différente, succès du changement.

## RESA — Planning et réservations

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |
|---|---|---|---|---|---|
| RESA-01 | Liste des créneaux en cartes : date, heure début–fin, type, responsable | `/`, `/booking` | `GET bookings/` | Membre | P1 |
| RESA-02 | Navigation « Créneaux précédents » / « Créneaux suivants » | `/booking` | `GET bookings/` (paramètres de période) | Membre | P1 |
| RESA-03 | Créneaux de durée variable (1 h, 45 min, 30 min), plage de 8 h à 21 h 30 | `/booking` | — | Membre | P1 |
| RESA-04 | Créneau libre affiché « Libre » avec bouton « Réserver » | `/booking` | — | Membre | P1 |
| RESA-05 | Formulaire de réservation : type et titulaire  | `/booking` | `POST bookings/` | Membre | P1 |
| RESA-06 | Types de réservation : `concert`, `jam`, `course` (Cours), `training` (Répétition), `record` (Enregistrement), `other` (Autre) | — | — | — | P1 |
| RESA-07 | Modification de sa réservation | `/booking` | `PUT bookings/{id}/` | Membre (propriétaire) | P1 | 
| RESA-08 | Suppression de sa réservation | `/booking` | `DELETE bookings/{id}/` | Membre (propriétaire) | P1 | 
| RESA-09 | Lien du responsable d'un créneau vers son profil | `/booking` | — | Membre | P2 | 
| RESA-10 | Un utilisateur ne peux supprimer que les créneaux qu'il a lui même réservés, limite de créneaux par personne ? , chevauchements | — | — | — | P1 | 
| RESA-11 | pas de chevauchements de créneaux possibles | — | — | — | P1 | 


## PROF — Profils

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité | 
|---|---|---|---|---|---|---|
| PROF-01 | Son propre profil | `/profile` | `GET users/{id}/` | Membre | P2 | 
| PROF-02 | Profil d'un autre membre | `/profile/:profileId` | `GET users/{id}/` | Membre | P2 |
| PROF-03 | En-tête de profil : photo et nom | `/profile/...` | — | Membre | P2 | 
| PROF-04 | Liste des groupes du membre, avec un lien vers chacun ; sinon « Aucun groupe pour le moment » | `/profile/...` | — | Membre | P2 | 
| PROF-05 | Photo de profil propre à chaque membre  | — | — | Membre | P3 |

## GRP — Groupes

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |
|---|---|---|---|---|---|
| GRP-01 | Liste des groupes | `/bands` | `GET bands/` | Membre | P2 |
| GRP-02 | Création d'un groupe : nom obligatoire, description facultative | `/bands` | `POST bands/` | Membre | P2 |
| GRP-03 | Page d'un groupe : nom, description, membres ; « Groupe non trouvé » si l'identifiant est inconnu | `/band/:bandId` | `GET bands/{id}/` | Membre | P2 | 
| GRP-04 | Recherche d'un membre à ajouter (« Aucun utilisateur trouvé » si rien) | `/band/:bandId` | `GET users/search/` | Membre | P2 |
| GRP-05 | Ajout et retrait de membres | `/band/:bandId` | `PUT bands/{id}/` | Membre du groupe | P2 |
| GRP-06 | Modification et suppression d'un groupe | `/band/:bandId` | `PUT`, `DELETE bands/{id}/` | Membre du groupe / Admin | P3 |

## EVT — Événements

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |
|---|---|---|---|---|---|
| EVT-01 | Page des événements | `/events` | - | Membre | P3 | 

## ADM — Administration

| ID | Fonctionnalité | Route front | Endpoint API d'origine | Rôle | Priorité |
|---|---|---|---|---|---|
| ADM-01 | Accès à la page d'administration réservé aux admins | `/admin-params` | — | Admin | P1 | 
| ADM-02 | « Nouveaux membres à vérifier » : accepter ou refuser | `/admin-params` | `POST users/respondUserVerif/{id}/` | Admin | P1 | 
| ADM-03 | « Liste des membres » avec recherche ; colonnes Utilisateur, Admin, Vérif, Actions | `/admin-params` | `GET users/full/`, `GET users/search/` | Admin | P2 | 
| ADM-04 | Modification d'un membre : nom d'utilisateur, prénom, nom, e-mail, admin oui/non | `/admin-params` | `PUT users/{id}/` | Admin | P2 |
| ADM-05 | Suppression d'un membre | `/admin-params` | `DELETE users/{id}/` | Admin | P2 | 
| ADM-06 | Création d'un compte : nom d'utilisateur, prénom, nom, e-mail, admin oui/non (compte créé déjà vérifié) | `/admin-params` | `POST rest-auth/registration/` puis `PUT users/{id}/` | Admin | P2 |
| ADM-07 | Ajout d'un créneau régulier : jour, créneau, type, responsable (utilisateur ou groupe), début et fin de période | `/admin-params` | `POST bookings/regular/` | Admin | P1 | 
| ADM-08 | « Liste des créneaux réguliers » : colonnes Type, Responsable, Jour, Créneau, Période, Actions | `/admin-params` | `GET bookings/regular/` | Admin | P1 | 
| ADM-09 | Modification et suppression d'un créneau régulier | `/admin-params` | `PUT`, `DELETE bookings/regular/{id}/` | Admin | P2 | 
| ADM-10 | Recherche du responsable d'un créneau régulier parmi les utilisateurs et les groupes | `/admin-params` | `GET users/search/`, `GET bands/` | Admin | P2 |

## UI — Interface et transverse

| ID | Fonctionnalité | Priorité |
|---|---|---|
| UI-01 | Barre latérale fixe : logo, Profil, Réservations, Paramètres, Admin (visible seulement pour les admins) | P1 | 
| UI-02 | Avatar de l'utilisateur en haut à droite | P3 | 
| UI-03 | Écran de chargement avec le logo du club | P3 | 
| UI-04 | Dates en français (jours et mois, formes longues et abrégées) | P1 |
| UI-05| Affichage correct sur mobile | P2 |

## DATA — Modèle de données ( copié de l'ancien code source)

| ID | Entité | Champs principaux | Statut |
|---|---|---|---|
| DATA-01 | `User` | `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_verified`, mot de passe |
| DATA-02 | `Band` | `name`, `description`, `members` (n–n vers `User`) |
| DATA-03 | `Booking` | `start`, `end`, `type` (voir RESA-06), titulaire : `user` ou `band` | 
| DATA-04 | `RegularBooking` | `day` (jour de la semaine), créneau horaire, `type`, responsable `user` ou `band`, début et fin de période |
| DATA-05 | `Visit` | utilisateur, date |


---

