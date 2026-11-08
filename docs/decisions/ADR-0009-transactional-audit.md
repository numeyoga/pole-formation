---
title: "ADR 0009 — Journal transactionnel des changements sensibles"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0009 — Journal transactionnel des changements sensibles

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)

## Contexte

US-08.02 complète les fondations de US-08.01 et nécessite une consultation autorisée ainsi que des événements avant/après pour les modifications critiques. Les conventions de planning et de capacité nécessaires ont été validées par le représentant du projet sous AUD-02 le 2026-11-08.

## Décision

Le module `audit` porte la lecture du journal et les raccordements aux changements sensibles. Les règles d’intervalle, de capacité et de transition sont dans un domaine indépendant de Spring/JPA. Les adaptateurs PostgreSQL orchestrent les lectures, verrous, mutations et événements dans une transaction Spring unique.

La migration V2 conserve les anciens identifiants, auteurs, dates et valeurs, et transforme les valeurs scalaires en objets JSONB. Les nouveaux événements stockent type et identifiant de cible, session lorsqu’elle existe et instantanés avant/après. Les changements sans effet n’ajoutent pas d’événement de correction ou de rôle.

Gestionnaires et administrateurs disposent de `READ_AUDIT` ; les intervenants en sont exclus côté serveur. Le journal possède uniquement une API de lecture, avec filtres par type, objet et session. Une séquence croissante fournit un ordre déterministe et un curseur exclusif ; la limite est de 1 à 100 événements. Les séquences sont transportées sous forme de chaînes décimales pour conserver leur précision dans le navigateur.

Les modifications de planning prennent d’abord un verrou transactionnel consultatif PostgreSQL partagé par ces opérations, puis le verrou de la session. Les réactivations vérifient la capacité sous ce verrou. Les conflits entre sessions sont signalés avec HTTP 409 et nécessitent une confirmation explicite avant l’écriture effective et l’audit ; aucun chevauchement interne n’est accepté.

Le contrat séparé `api/audit.openapi.yaml` génère les types consommés par l’adaptateur frontend du journal. Le composant Lit reçoit des modèles de présentation, propose filtres et pagination, et gère chargement, vide, erreur et focus.

## Alternatives

Un journal asynchrone exigerait un mécanisme supplémentaire pour garantir la cohérence et la livraison. Des logs techniques seuls ne fournissent pas une consultation métier avant/après. Une pagination par décalage pourrait répéter ou sauter des événements lors d’ajouts entre deux pages.

## Conséquences

Si l’audit échoue, la mutation est annulée. Un refus métier ne crée aucun événement de succès. Les opérations minimales ajoutées permettent de prouver les six critères ; elles ne livrent pas l’ensemble des écrans de planification, inscription ou administration des intervenants.

Le verrou consultatif sérialise les mutations de planning et réactivation de cette tranche : choix simple pour le MVP, à réévaluer si la charge augmente. Il ne remplace pas une stratégie d’édition optimiste pour les futurs formulaires partagés. Le journal ne propose ni modification ni suppression via API ; il ne constitue pas un dispositif de scellement contre un administrateur de base.

La politique de conservation et le provisionnement de production restent ouverts. Les réponses de conflit et la consultation restent soumises aux habilitations. Voir le [rapport de validation](../reference/quality/us-08-02-validation.md).
