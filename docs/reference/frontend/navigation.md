---
title: "Navigation et organisation des écrans"
created: 2026-11-15
updated: 2026-11-16
status: accepted
type: reference
---

# Navigation et organisation des écrans

La navigation est définie dans `frontend/src/app/navigation.ts`. Les permissions serveur restent l’autorité pour les opérations et données.

## Sommaire

- [Pages](#pages)
- [Fiches autonomes](#fiches-autonomes)
- [État et navigation](#état-et-navigation)
- [Sessions et pilotage](#sessions-et-pilotage)
- [Limites](#limites)

## Pages

| Groupe | Pages |
|---|---|
| Activité | Sessions, Collaborateurs, Intervenants, Pilotage |
| Ressources | Catalogue, Profils d’emploi, Référentiel |
| Administration | Paramètres, Accès, Journal |

Le Référentiel expose quatre sous-pages : Domaines, Sous-domaines, Compétences et Explorer le référentiel. Paramètres ouvre les classifications. Les entrées sont filtrées selon les permissions du compte.

## Fiches autonomes

Le nom d’une formation, d’un profil ou d’un collaborateur ouvre sa fiche. Chaque rubrique possède une URL partageable ; un rechargement restaure la rubrique demandée, sous réserve des permissions.

| Fiche | Route | Rubriques |
|---|---|---|
| Formation | `/catalogue/:uuid/:rubrique` | Présentation, Compétences, Sessions |
| Profil d’emploi | `/profils/:uuid/:rubrique` | Présentation, Exigences, Formations correspondantes |
| Collaborateur | `/collaborateurs/:uuid/:rubrique` | Informations, Participations |

Les rubriques utilisent des liens natifs avec `aria-current`. Les formulaires de modification restent dans des dialogues courts. Le retour à la liste conserve sa recherche et sa pagination. Dans une même fiche, les rubriques déjà visitées restent montées : une saisie de créneau est conservée en allant modifier la présentation de la formation. Quitter la fiche ou recharger la page réinitialise ses saisies locales non enregistrées.

Les participations du collaborateur sont consultables directement et paginées. Aucun lien collaborateur–profil ni compétence acquise individuellement n’est ajouté.

## État et navigation

Les liens possèdent une URL réelle. History API et `popstate` assurent retour/avance ; URLPattern possède un repli de comparaison exacte. Le serveur expose le document HTML sur une liste explicite de routes UI, sans transformer les erreurs API en document HTML.

Une seule page métier est visible. Les composants déjà visités restent montés mais masqués et inertes pour conserver recherches, pagination et saisies pendant la session de navigation. Le rechargement complet et la déconnexion réinitialisent cet état local. Aucun jeton n’est enregistré dans localStorage.

Chaque changement de route ferme les dialogues ouverts, y compris dans les Shadow DOM imbriqués. Une réponse tardive ne doit pas déplacer le focus de la destination. La navigation focalise le titre du panneau métier, ou le titre principal à défaut. Un bouton d’évitement traverse explicitement le Shadow DOM. Sur petit écran, le bouton Navigation ouvre et ferme la liste des pages ; son premier lien reçoit le focus à l’ouverture.

## Sessions et pilotage

Sessions affiche les sessions accessibles dans un tableau filtrable par intitulé et état. L’ouverture des participations remplace la liste par un détail avec retour explicite et restitution du focus. Les dates et formations ne sont pas inventées : l’API de cette liste ne les fournit pas.

La gestion détaillée reste accessible depuis Catalogue → Gérer les sessions. La fiche session possède trois onglets : Vue d’ensemble, Créneaux, Intervenants. Les flèches, Home et End déplacent le focus ; Entrée ou Espace active l’onglet. Les champs sont conservés lors des changements d’onglet. Clôture, annulation et planification sont dans Vue d’ensemble.

Le pilotage regroupe les indicateurs existants en cartes. Le volet « Filtrer l’activité » est replié initialement pour laisser les indicateurs visibles. Aucun nouvel indicateur métier n’est calculé dans le frontend.

## Limites

Le référentiel conserve son exploration hiérarchique existante. La recherche des sessions porte sur la liste accessible chargée, sans pagination serveur supplémentaire. La recette humaine et les contrôles lecteur d’écran/zoom réel à 200 % restent nécessaires.
