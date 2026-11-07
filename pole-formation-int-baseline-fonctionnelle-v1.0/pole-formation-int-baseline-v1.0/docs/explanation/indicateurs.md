---
title: "Comprendre les indicateurs et leur temporalité"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "explanation"
---

# Comprendre les indicateurs et leur temporalité

## Sommaire

- [Indicateur de stock et indicateur de période](#indicateur-de-stock-et-indicateur-de-période)
- [Indicateurs de sessions](#indicateurs-de-sessions)
- [Indicateurs de participations](#indicateurs-de-participations)
- [Attention aux ratios](#attention-aux-ratios)
- [Références](#références)

## Indicateur de stock et indicateur de période

Le nombre de formations actives est un indicateur de stock, calculé à la date de consultation. Les nombres de sessions sont rattachés à une période de reporting par la **date de début du premier créneau**.

## Indicateurs de sessions

- **Planifiées**, **Terminées**, **Annulées** sont comptées séparément.
- Une session multijour traversant deux périodes n'est comptée qu'une fois.
- Les sessions Annulées sont exclues du nombre de sessions réalisées.

## Indicateurs de participations

- Les états `Inscrite`, `Présente`, `Absente`, `Désistée` doivent être distingués.
- Les participations des sessions annulées conservent leur état historique mais sont exclues des présences et absences **réalisées**.
- Les désistements ne sont pas des absences. Une réactivation remet l'état courant à `Inscrite`, mais les transitions antérieures restent dans l'audit.

## Attention aux ratios

Un taux de présence nécessite un dénominateur métier explicite (par exemple inscrits ayant effectivement été attendus lors de sessions terminées). Aucun pourcentage de réussite ou score de maîtrise n'est prévu au MVP. L'absence d'un taux validé ne doit pas empêcher la livraison des compteurs simples.

## Références

- [Règles de pilotage](../reference/invariants-regles.md)
- [US-07.01 / US-07.02](../reference/backlog-mvp.md#ep-07-pilotage)
