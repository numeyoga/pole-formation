---
title: "Réserves documentaires et conventions de conception"
created: 2026-11-07
updated: 2026-11-08
version: "1.4.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Réserves documentaires et conventions de conception

## Sommaire

- [Réserve sur le cadrage source](#réserve-sur-le-cadrage-source)
- [Conventions proposées (non arbitrages supplémentaires)](#conventions-proposées-non-arbitrages-supplémentaires)
- [Arbitrages fonctionnels clos](#arbitrages-fonctionnels-clos)
- [Clarifications d'intégration à confirmer hors noyau métier](#clarifications-dintégration-à-confirmer-hors-noyau-métier)
- [Références](#références)

## Réserve sur le cadrage source

Le document initial « Pôle formation INT — Contexte et spécification métier », annoncé comme Markdown de 48 Ko et 17 sections, **n'était pas accessible comme contenu intégral** au moment de cette production. Seule une fiche descriptive était présente dans les sources consultables. Les décisions explicitement reprises dans les conversations et les 6 arbitrages finaux ont été intégrés. Ce référentiel doit être rapproché du texte original lorsqu'il sera disponible, en particulier de la définition de l'option B.

## Conventions proposées (non arbitrages supplémentaires)

1. Pour les domaines et sous-domaines, l’unicité et la normalisation sont validées par REF-01 et REF-02 ; le parent d’un sous-domaine est fixé à la création. Pour les autres types de référentiels, les modalités détaillées restent à arbitrer. Les ID techniques ne changent pas.
3. Une session sans créneau ne peut passer de Brouillon à Planifiée.
4. Les états de Formation et Session proposés sont Brouillon/Active/Archivée et Brouillon/Planifiée/Terminée/Annulée.
6. Une réduction de capacité au-dessous du nombre de places occupées est refusée.
7. Le fuseau métier d’entrée et de restitution reste à préciser ; les instants du contrat API comportent un décalage explicite et le journal affiche UTC.
8. Les formulaires de création valident les champs minimaux ; nom/prénom et identifiant professionnel sont obligatoires pour le collaborateur.
9. Les opérations auditables sont atomiques avec leur résultat métier : un audit ne marque jamais comme réussi un changement refusé.
10. La présentation détaillée des indicateurs (libellés et taux) sera affinée avec les représentants du pôle.

## Arbitrages fonctionnels clos

Les arbitrages HB-01 à HB-06 sont **validés**, pas ouverts : voir [registre](decisions-metier.md). Ils fixent le référentiel collaborateur minimal, le compte facultatif de l'intervenant, l'absence de transformation des participations à l'annulation, la saisie après dernier créneau, les restrictions sur la modification des créneaux et le contrôle de réactivation.

AUD-02, validé le 2026-11-08, clôt les anciennes conventions 2 et 5 ainsi que le choix des intervalles demi-ouverts : aucun chevauchement interne, créneaux consécutifs autorisés, Présente/Absente consomment toujours une place. Les autres propositions de cette page restent proposées.

## Clarifications d'intégration à confirmer hors noyau métier

Le fournisseur d'identité et la politique de durée de conservation/audit nécessitent un cadrage organisationnel. Ces informations n'altèrent pas les cardinalités métier mais conditionnent la mise en production.

## Références

- [Décisions](decisions-metier.md)
- [Règles](invariants-regles.md)
