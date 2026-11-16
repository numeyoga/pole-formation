---
title: "Validation des fiches autonomes"
created: 2026-11-16
updated: 2026-11-16
status: accepted
type: reference
---

# Validation des fiches autonomes

Suite de la [refonte de navigation](interface-refonte-2026-11-15.md), développée les 15 et 16 novembre 2026. Modifications locales non commitées ; aucune recette humaine ni clôture du MVP n’est déduite des tests automatisés.

## Sommaire

- [Périmètre](#périmètre)
- [Vérifications](#vérifications)
- [Preuves locales](#preuves-locales)
- [Reste à faire](#reste-à-faire)

## Périmètre

Fiches partageables Formation (Présentation, Compétences, Sessions), Profil (Présentation, Exigences, Formations correspondantes) et Collaborateur (Informations, Participations). Les retours conservent les recherches et paginations des listes ; les rubriques d’une même formation conservent les saisies en cours. Les formulaires courts restent dans des dialogues. Les règles métier et l’option B restent inchangées.

GPT-6.1 Sol a développé les routes, leur fallback serveur et la fiche formation, puis vérifié les variantes de navigation. L’agent principal a intégré les fiches profil et collaborateur, corrigé les dialogues imbriqués et exécuté les validations. Voir la [référence des écrans](../frontend/navigation.md).

## Vérifications

| Contrôle | Résultat |
|---|---|
| Construction | `mise run build` réussi le 16 novembre ; TypeScript, Vite et JAR, puis reconstruction après correction de l’espacement des boutons du profil. |
| Vitest | 46 tests réussis dans 15 fichiers. |
| Maven `verify` | 106 tests réussis, zéro échec, erreur ou exclusion ; JAR arrêté pendant la compilation. |
| Parcours ciblés du 15 novembre | 7 scénarios de fiches réussis sur Vite, avant la validation globale du JAR. |
| Suite navigateur du 16 novembre | 70 scénarios réussis en une exécution de 2,2 minutes sur le JAR final ; zéro retry. |
| Suivi et liens | Manifeste valide, liens locaux vérifiés et `git diff --check` sans erreur. |

Les scénarios ajoutés couvrent liens directs et rechargement, retour navigateur, refus selon le rôle, fiche absente, modification, conservation des filtres, fermeture d’un dialogue imbriqué, fin d’enregistrement après navigation, conservation d’un créneau non enregistré en modifiant la présentation. Les parcours historiques restent exécutés. Les contrôles axe, clavier et mobile apportent une preuve partielle d’accessibilité.

Le dialogue imbriqué a été reproduit en échec avant correction puis validé : [DEF-033](../../../revue/defauts/2026-11-15-DEF-033-dialogues-rubriques.md). Une erreur intermédiaire de déclaration d’état Lit a été corrigée avant la série ciblée réussie ; les exécutions échouées ne sont pas comptées comme validation finale.

## Preuves locales

Journaux du 16 novembre : `/tmp/pole-fiches-build-final.log`, `/tmp/pole-fiches-unit.log`, `/tmp/pole-fiches-backend.log`, `/tmp/pole-fiches-e2e-final.log`. Une première suite navigateur a perdu son serveur après 35 scénarios réussis (processus Java terminé avec code 143, puis refus de connexion) ; elle n’est pas une preuve globale. Le serveur a été relancé sur l’hôte avant de reprendre toute la suite. Les rapports serveur se trouvent dans `backend/target/surefire-reports/`. Ces fichiers sont temporaires.

Les captures Formation et Profil sur bureau et Collaborateur sur mobile ont été inspectées ; l’espacement des actions du profil a été corrigé puis revérifié. Les captures navigateur sont temporaires dans `frontend/test-results/` : `formation-detail-desktop.png`, `profile-detail-desktop.png`, `collaborator-detail-mobile.png`, ainsi que les captures de navigation et de session existantes. Les journaux temporaires du 15 novembre ne sont plus disponibles après changement d’environnement ; leurs résultats ont été observés dans la session de développement.

## Reste à faire

Recette humaine des nouveaux parcours, lecteur d’écran et zoom navigateur réel à 200 %. Les anciennes acceptations métier ne valent pas acceptation de cette interface. Les changements ne sont pas committés et les anciens hashes de validation sont conservés dans le suivi.
