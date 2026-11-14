---
title: "Livraison et validation de US-01.01"
created: 2026-11-08
updated: 2026-11-14
status: accepted
type: reference
---

# Livraison et validation de US-01.01

## Sommaire

- [Revalidation technique du 14 novembre 2026](#revalidation-technique-du-14-novembre-2026)

- [Périmètre](#périmètre)
- [Traçabilité des critères](#traçabilité-des-critères)
- [Validation technique](#validation-technique)
- [Limites et recette](#limites-et-recette)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

Création, consultation paginée, modification et désactivation des domaines par gestionnaires et administrateurs. Les champs sont validés selon REF-01, avec index unique PostgreSQL sur le code sans casse, y compris pour les domaines désactivés. Les identifiants restent stables.

Le tableau affiche les domaines actifs et désactivés et permet de consulter les sous-domaines existants. Les formulaires utilisent des dialogues natifs et transmettent une version de fiche. Les erreurs de champ et de doublon sont présentées ; une fiche périmée peut être rechargée avant une nouvelle sauvegarde.

Le raccordement minimal des sous-domaines sert à prouver le parent actif et la conservation de l’historique. Il ne remplace pas US-01.02 : codes, désactivation et administration complète des sous-domaines restent à développer.

## Traçabilité des critères

| Critère US-01.01 | Preuve |
|---|---|
| 1 — Code et libellé valides, domaine enregistré et consultable | `manager_can_create_and_read_a_domain` et mapping frontend |
| 2 — Code déjà utilisé refusé explicitement | `domain_codes_are_unique_ignoring_case_and_remain_reserved_after_deactivation`, création concurrente testée |
| 3 — Désactivation sans perte d’historique ni nouveau rattachement | `deactivated_domain_keeps_its_children_and_rejects_new_attachments` |

Les scénarios complémentaires contrôlent les longueurs et champs vides, les droits serveur, les versions périmées et la migration des anciennes lignes. La compatibilité du PUT historique de libellé reste couverte par les tests de US-08.01.

## Validation technique

Criticité métier récupérable, persistance et concurrence aux frontières réelles : tests HTTP sur PostgreSQL Testcontainers, règles de valeur dans le domaine, parcours navigateur pour les formulaires et le focus. Aucun mock d’un module du projet.

Le premier test de création a échoué avec 404 au lieu de 201 avant implémentation. Maven `clean verify` : **33 tests réussis**, aucun échec ni test ignoré. Deux créations simultanées du même code donnent exactement un succès et un conflit. La migration V2→V3 conserve les identifiants/libellés et attribue des codes techniques uniques, qui restent stables au redémarrage.

Dix mutations ciblées ont été détectées, dont trois propres aux domaines : suppression du contrôle de parent actif, suppression du contrôle de version et suppression des limites de champs. Les sources restaurées sont celles de la validation complète.

Génération OpenAPI, TypeScript strict, build Vite et trois tests Vitest de mapping : réussis.

Playwright Chromium : **11 parcours réussis**, sans retry, dont création/modification/désactivation avec conservation d’un sous-domaine, doublon explicite dans le formulaire, édition concurrente avec rechargement, absence de gestion des domaines pour l’intervenant et pagination/reprise réseau. Les parcours de connexion et du journal restent couverts. Un passage ciblé supplémentaire vérifie le défilement horizontal au clavier du tableau étroit.

Axe ne signale aucune violation sur les états contrôlés, notamment dialogue de création, erreur de doublon et tableau sur viewport étroit. Les captures du tableau et du dialogue ont été inspectées à 1440 et 375 pixels ; le document ne déborde pas horizontalement et le tableau reste dans son conteneur de défilement. Les noms, erreurs et focus sont vérifiés, y compris Escape et restitution du focus.

## Limites et recette

Le représentant du projet a validé la livraison locale le 2026-11-08 : voir l’[accord utilisateur](acceptance-2026-11-08.md#validation-de-us-0101). Le commit de livraison et la révision techniquement validée sont référencés dans `tracking/stories.json`.

Les codes `MIG-…` des lignes héritées sont des codes techniques de transition, pas des codes métier validés ; ils sont éditables. Le défaut SQL conserve la compatibilité des fixtures historiques. L’ancien PUT avec seul libellé n’exige pas de version, contrairement aux clients actuels qui transmettent la précondition ; cette compatibilité est décrite dans ADR 0010.

Ni suppression physique, ni réactivation de domaine, ni administration complète des sous-domaines ne sont annoncées livrées. L’acceptation AA des écrans précédents ne vaut pas nouveau scan de ce nouvel écran ; les méthodes humaines d’accessibilité n’ont pas été détaillées dans la validation utilisateur et leur exécution individuelle n’est pas affirmée.

Références : [ADR 0010](../../decisions/ADR-0010-domain-reference.md), [contrat](../../../api/domains.openapi.yaml), [guide](../../how-to/run-local-app.md).


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

L’acceptation humaine antérieure est conservée dans le manifeste.

## Revalidation technique du 14 novembre 2026

Le code applicatif `8aa353c5fdf8471a646475082526e9cbbb972903` a été revalidé par les suites complètes backend (105 tests), Vitest (43 tests), scripts (13 tests) et les 59 scénarios Chromium distincts. Le [rapport commun du 14 novembre](validation-stories-2026-11-14.md) détaille les commandes, l’interruption par signal de la longue commande navigateur et le lot de complément réussi. `mise run check` confirme les versions locales et l’accès aux services partagés.

Cette entrée renouvelle uniquement la preuve technique. Les recettes humaines déjà consignées conservent leur périmètre historique ; les huit nouvelles stories restent à recetter séparément.
