---
title: "Cycles de vie et transitions"
created: 2026-11-07
updated: 2026-11-09
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Cycles de vie et transitions

## Sommaire

- [Formation](#formation)
- [Session](#session)
- [Participation](#participation)
- [Références](#références)

## Formation

États confirmés explicitement le 2026-11-09 dans REF-07 : `Brouillon → Active → Archivée → Active` (réactivation), avec archivage également possible depuis Brouillon. Réactivation validée : vérifier code unique, champs obligatoires, absence d'incohérence bloquante ; historique inchangé. Toute nouvelle session applicative requiert une formation Active.

## Session

États de travail proposés : `Brouillon → Planifiée → Terminée` ; annulation accessible depuis Brouillon/Planifiée.

- Planification : au moins un créneau valide ; capacité facultative ; intervenant facultatif.
- Créneaux de session planifiée : modifications contrôlées avec audit et avertissements de conflit.
- Clôture : date courante postérieure ou égale à la fin du dernier créneau ; tous les participants dans un état définitif. Une session sans participant peut être close.
- Annulation : ne modifie **aucun état de participation** ; conserve l'historique ; sessions et présences réalisées l'excluent.
- Après clôture : aucune modification ordinaire des créneaux ; correction de présences possible seulement par gestionnaire habilité avec audit.

## Participation

| Origine | Destination | Condition |
|---|---|---|
| Création | Inscrite | Session Planifiée, collaborateur actif et capacité disponible |
| Inscrite | Présente | À partir de la fin du dernier créneau, utilisateur autorisé |
| Inscrite | Absente | À partir de la fin du dernier créneau, utilisateur autorisé |
| Inscrite | Désistée | Désistement enregistré |
| Désistée | Inscrite | Réinscription et capacité disponible, même identité de participation |
| Présente / Absente | Absente / Présente | Correction par habilitation appropriée ; après clôture, gestionnaire avec audit |

Les états définitifs pour clôture sont `Présente`, `Absente` et `Désistée`. Le cas de corrections d'absence et leur calendrier sont détaillés dans [réserves](reserves-conventions.md).

## Références

- [Règles](invariants-regles.md)
- [Backlog](backlog-mvp.md)
