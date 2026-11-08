---
title: "ADR 0010 — Domaines, identité et compatibilité"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0010 — Domaines, identité et compatibilité

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-01.01 devient la première administration complète d’un référentiel. Le socle avait un domaine réduit à un identifiant et un libellé, ainsi qu’un PUT de libellé utilisé par les tests d’habilitation. Le représentant du projet a validé les règles de code et de libellé sous REF-01 le 2026-11-08.

## Décision

Le module backend `referentiel` contient la valeur métier `TrainingDomain`, le cas d’utilisation et le port PostgreSQL. Spring Data JPA porte la persistance, avec un index unique PostgreSQL sur `lower(code)`, sans condition sur l’activation. Le domaine normalise les espaces de début/fin et valide les longueurs ; le frontend ne calcule pas l’unicité.

Les identifiants restent stables pendant modification et désactivation. Une désactivation conserve le domaine et ses sous-domaines ; aucune suppression physique ni réactivation n’est exposée par cette tranche.

La migration V3 conserve les lignes déjà présentes et leur attribue un code technique `MIG-…` stable une fois créé, faute de code métier dans l’ancien schéma. Ce code ne prétend pas être une donnée métier validée : le gestionnaire peut le modifier. Le défaut SQL conserve la compatibilité des fixtures historiques, qui ne renseignaient pas de code.

Les nouvelles interfaces envoient la version lue pour modifier ou désactiver une fiche ; une version périmée produit HTTP 409. L’ancien PUT avec seul libellé est conservé et délégué au même service, sans précondition de version pour compatibilité. La garantie de non-écrasement porte donc sur les clients utilisant cette précondition, notamment l’écran livré.

Création de rattachements et désactivation du domaine utilisent le même verrou parent : un nouveau sous-domaine n’est accepté que sous un parent actif. La table et le raccordement minimal de sous-domaines servent à prouver ce critère ; code, activation, compétences et formulaires complets des sous-domaines restent dans US-01.02/03.

Le contrat `api/domains.openapi.yaml` génère les types consommés par l’adaptateur de la feature frontend. Les dialogues sont natifs ; le tableau se défile dans son conteneur étroit et les actions serveur restent autorisées par `WRITE_REFERENTIAL` pour gestionnaires et administrateurs.

## Conséquences

Un doublon, même concurrent ou issu d’un domaine désactivé, est rejeté par la base et exposé comme conflit avec erreur du champ code. Les anciens chemins d’écriture de libellé de domaine dans le module d’habilitations sont retirés pour ne pas contourner le nouveau service.

La pagination est serveur, de 1 à 100 lignes, triée par code sans casse puis identifiant. Le client conserve les états chargement, erreur, vide et les versions sans exposer ces détails techniques à l’utilisateur. Le code et libellé restent modifiables après désactivation ; l’activation est changée uniquement par l’action dédiée.

La gestion des codes des autres référentiels et les écrans complets des sous-domaines restent ouverts. Les éventuelles évolutions de l’ancien PUT nécessiteront une migration de contrat explicite. Voir le [rapport US-01.01](../reference/quality/us-01-01-validation.md).
