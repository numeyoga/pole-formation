---
title: "Registre des décisions ouvertes"
description: "Questions à trancher et conventions provisoires sans fausse validation."
created: 2026-11-07
updated: 2026-11-07
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
| Rôles et permissions | Ouvert | Pôle formation / intervenants à préciser | Avant accès aux dossiers collaborateurs |
| Données personnelles, confidentialité, conservation | Ouvert | Minimisation, traçabilité, contrôle d'accès | Avant stockage de données réelles |
| Versions exactes Spring Boot/Slab/Lit/Node/PostgreSQL | Ouvert | Choisir versions stables compatibles et verrouiller manifests | Bootstrap |
| Sens métier détaillé des classifications d'exigence | Ouvert | Codes et libellés configurables ; ne pas fixer de sémantique sans validation | Configuration du référentiel |
| Identités et unicité des référentiels | Ouvert | IDs stables et archivage, contraintes à valider | Migrations initiales |

## Priorité moyenne

| Sujet | État | Position de travail | Déclencheur |
|---|---|---|---|
| Gestion des activités du pôle (actions, échéances, décisions) | Hors baseline v1.0 / à cadrer | Ne pas la confondre avec le pilotage des sessions et participations couvert par EP-07 | Arbitrage du périmètre fonctionnel |
| Tableaux complexes | Ouvert | HTML natif, TanStack si besoin prouvé | Premier tableau difficile |
| Compatibilité détaillée Slab/Lit et interfaces de personnalisation | À vérifier par prototype | Garder l'adaptation minimale | Avant première feature Slab |
| Modalités d'édition concurrente | Ouvert | Prévoir conflit/version optimiste si cas réel | Édition partagée |
| Notifications, audit formel, import/export | Ouvert | Pas de promesse MVP au-delà de l'historique métier | Besoin utilisateur |
| Choix Maven/Gradle et gestionnaire JS | Ouvert | Standard le plus simple pour l'équipe | Bootstrap |
| Répartition exacte des modules backend | Ouvert | Découpage illustratif catalogue/parcours/activités | Première fonctionnalité |
| Présence par créneau, listes d'attente et attestations | Évolution future | Le MVP suit la présence globale à la session | Extension périmètre |
| Stratégie i18n | Partiellement ouverte | Français initial, ressources centralisées | Avant ajout seconde langue |

## Procédure d'arbitrage

1. Identifier la règle ou intégration concernée. 2. Documenter les options, impacts et risques. 3. Valider une décision. 4. Créer/modifier un [ADR](../../decisions/README.md) lorsqu'elle est structurante. 5. Modifier `status` et `updated` des documents affectés.

Une position de travail **n'est pas** une décision métier acceptée. Voir [règles métier](../domain/business-rules.md).
