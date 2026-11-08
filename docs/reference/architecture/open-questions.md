---
title: "Registre des décisions ouvertes"
description: "Questions à trancher et conventions provisoires sans fausse validation."
created: 2026-11-07
updated: 2026-11-08
status: proposed
type: reference
tags:
  - decisions
  - open
---

# Registre des décisions ouvertes

,
## Sommaire
- [Priorité haute](#priorité-haute)
- [Priorité moyenne](#priorité-moyenne)
- [Procédure d'arbitrage](#procédure-darbitrage)

## Priorité haute

| Sujet | État | Position de travail | Déclencheur |
|---|---|---|---|
| Fournisseur d'identité | Ouvert | Spring Security session, SSO si disponible | Avant authentification réelle |
| Rôles et permissions | Matrice arbitrée | [Trois rôles fixes et matrice validée](roles-permissions.md) ; provisionnement de production ouvert | Avant authentification de production |
| Données personnelles, confidentialité, conservation | Ouvert | Minimisation, traçabilité, contrôle d'accès | Avant stockage de données réelles |
| Versions exactes Spring Boot/Slab/Lit/Node/PostgreSQL | Bootstrap réalisé | [Versions applicatives verrouillées](../../decisions/ADR-0007-bootstrap-habilitations.md) ; Slab différé jusqu’à un besoin complexe | Premier usage Slab / mises à jour |
| Sens métier détaillé des classifications d'exigence | Ouvert | Codes et libellés configurables ; ne pas fixer de sémantique sans validation | Configuration du référentiel |
| Identités et unicité des référentiels | Partiellement arbitré | Domaines, sous-domaines et compétences : REF-01/REF-02/REF-03 validées, codes uniques sans casse même après désactivation ; parents du sous-domaine et de la compétence fixés à la création. Détails des autres référentiels à confirmer | Première migration de chaque référentiel |

## Priorité moyenne

| Sujet | État | Position de travail | Déclencheur |
|---|---|---|---|
| Gestion des activités du pôle (actions, échéances, décisions) | Hors baseline v1.0 / à cadrer | Ne pas la confondre avec le pilotage des sessions et participations couvert par EP-07 | Arbitrage du périmètre fonctionnel |
| Tableaux complexes | Ouvert | HTML natif, TanStack si besoin prouvé | Premier tableau difficile |
| Compatibilité détaillée Slab/Lit et interfaces de personnalisation | À vérifier par prototype | Garder l'adaptation minimale | Avant première feature Slab |
| Modalités d'édition concurrente | Partiellement arbitré | Domaines : version transmise par les nouveaux formulaires, ancien PUT libellé compatible sans précondition. Sous-domaines et compétences : version obligatoire pour modification et désactivation. Conflit 409 si périmée. Autres écrans à préciser | Édition partagée |
| Notifications, audit formel, import/export | Ouvert | Pas de promesse MVP au-delà de l'historique métier | Besoin utilisateur |
| Choix Maven/Gradle et gestionnaire JS | Arbitré | Maven Wrapper et npm, [ADR 0007](../../decisions/ADR-0007-bootstrap-habilitations.md) | Réévaluation si besoin démontré |
| Répartition exacte des modules backend | Partiellement arbitré | Module `habilitations` implémenté ; modules métier suivants à préciser par feature | Fonctionnalités suivantes |
| Présence par créneau, listes d'attente et attestations | Évolution future | Le MVP suit la présence globale à la session | Extension périmètre |
| Stratégie i18n | Partiellement ouverte | Français initial, ressources centralisées | Avant ajout seconde langue |

## Procédure d'arbitrage

1. Identifier la règle ou intégration concernée. 2. Documenter les options, impacts et risques. 3. Valider une décision. 4. Créer/modifier un [ADR](../../decisions/README.md) lorsqu'elle est structurante. 5. Modifier `status` et `updated` des documents affectés.

Une position de travail **n'est pas** une décision métier acceptée. Voir [règles métier](../domain/business-rules.md).
