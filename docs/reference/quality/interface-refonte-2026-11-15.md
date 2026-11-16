---
title: "Validation de la refonte de navigation"
created: 2026-11-15
updated: 2026-11-16
status: accepted
type: reference
---

# Validation de la refonte de navigation

Modifications locales non commitées du 15 novembre 2026, sur données fictives. Les preuves de commits précédents ne sont pas remplacées par un hash non testé. Aucune nouvelle recette humaine n’est enregistrée.

## Sommaire

- [Périmètre](#périmètre)
- [Stratégie](#stratégie)
- [Résultats](#résultats)
- [Limites et suite](#limites-et-suite)

## Périmètre

Navigation latérale par pages, routes partageables et fallback serveur, conservation des composants visités, liste de sessions filtrable et détail des participations, fiche session à trois onglets, cartes de pilotage. La [référence de navigation](../frontend/navigation.md) décrit les comportements livrés.

Le développement du shell et des onglets a été délégué à GPT-6.1 Sol. L’intégration, les corrections clavier, les adaptations de parcours et les validations finales sont prises en charge par l’agent principal après la limite d’utilisation du sous-agent.

## Stratégie

Navigation : présentation, comportement utilisateur récupérable, criticité moyenne ; tests navigateur sur vraies API et base fictive. Routage serveur : frontière HTTP sensible aux autorisations, criticité haute, test ciblé en échec avant correction puis réussi selon le rapport du sous-agent. Tests Vitest du contrat de résolution des routes et permissions ; aucune doublure de module applicatif nouvelle. Les scénarios historiques sont adaptés pour visiter explicitement les pages. Contrôles clavier, mobile et axe, sans certification WCAG.

Le guide Modern Web Guidance `tabs` a été consulté. Le mécanisme expérimental `focusgroup` a été remplacé après échec reproductible du parcours clavier : rôles ARIA, associations tab/panel, activation manuelle et gestion explicite des flèches, Home et End. Voir [DEF-031](../../../revue/defauts/2026-11-15-DEF-031-navigation-shadow-onglets.md).

## Résultats

| Contrôle | Résultat |
|---|---|
| `mise run build` | TypeScript, Vite et JAR réussis ; application reconstruite et redémarrée sur 8080. |
| Vitest | 45 tests réussis, 15 fichiers. |
| Maven `verify` | 106 tests, zéro échec, erreur ou exclusion. |
| Playwright global sur le JAR | 63 scénarios réussis en une exécution, sans retry, en 2,1 minutes. |
| Ajustement final du volet de filtres | Après nouvelle construction : 7 scénarios navigation et participations/pilotage réussis. |
| Suivi, liens locaux, `git diff --check` | Réussis. |

La suite globale précède uniquement le dernier ajustement visuel du volet de filtres ; les parcours concernés ont ensuite été rejoués sur le nouveau JAR. Les premières exécutions ont identifié les adaptations nécessaires des tests et défauts clavier ; elles ne sont pas comptées comme suite finale réussie. Une première commande Maven a été interrompue pour éviter de reconstruire le JAR pendant son exécution ; elle n’est pas une preuve. La commande `verify` retenue a terminé après arrêt du serveur.

Axe et clavier sont intégrés aux parcours. Les scénarios vérifient navigation directe, historique navigateur, recherche conservée, autorisation refusée, retour depuis un dialogue, erreur réseau tardive, onglets et conservation de champs. Les captures bureau 1440 px, mobile 375 px et fiche session mobile ont été inspectées. L’explorateur reste également contrôlé à 2048 et 1024 px.

Journaux locaux : `/tmp/pole-refonte-backend.log`, `/tmp/pole-refonte-final-build.log`, `/tmp/pole-refonte-unit-final.log`, `/tmp/pole-refonte-final-e2e.log`, `/tmp/pole-refonte-pilotage-final.log`. Les captures `frontend/test-results/navigation-desktop.png`, `navigation-mobile.png` et `session-planned-mobile.png` sont temporaires.

Deux défauts ont été reproduits et corrigés : [DEF-031](../../../revue/defauts/2026-11-15-DEF-031-navigation-shadow-onglets.md) et [DEF-032](../../../revue/defauts/2026-11-15-DEF-032-contexte-navigation-asynchrone.md). La revue finale de Sol a fourni les deux cas de DEF-032, ensuite vérifiés rouges puis verts par l’agent principal.

## Limites et suite

La recette humaine, le lecteur d’écran et le zoom navigateur réel à 200 % restent à effectuer. Les anciennes acceptations métier demeurent historiques et ne valent pas acceptation de cette interface.

Ce premier lot n’incluait pas les fiches autonomes Formation, Profil et Collaborateur ; leur ajout est décrit dans la [validation des fiches](interface-fiches-2026-11-16.md). La gestion des sessions reste ouverte depuis le catalogue, tandis que Sessions expose les participations. Aucun agenda calendrier ni nouvelle règle métier n’est ajouté.
