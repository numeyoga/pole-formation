---
title: "Entités et cardinalités"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Entités et cardinalités

## Sommaire

- [Conventions](#conventions)
- [Entités](#entités)
- [Contraintes de relation](#contraintes-de-relation)
- [Références](#références)

## Conventions

Ces attributs sont **fonctionnels** : les `ID` sont des identifiants techniques stables, les codes professionnels n'en tiennent pas lieu. Les noms d'entités sont proposés et non une obligation d'implémentation. L'identité/compte et le journal d'audit sont transversaux aux 14 entités.

## Entités

| Entité | Attributs principaux | Cardinalités |
|---|---|---|
| `DomaineCompetence` | ID, code, libellé, description, actif | 1 → 0..N SousDomaineCompetence |
| `SousDomaineCompetence` | ID, code, libellé, description, actif, domaine | 1 → 1 Domaine ; 1 → 0..N Compétence |
| `Competence` | ID, code, libellé, description, actif, sous-domaine | 1 → 1 SousDomaine |
| `ProfilEmploi` | ID, code, libellé, description, actif | 1 → 0..N ExigenceCompetence |
| `ClassificationCompetence` | ID, code, libellé, ordre, actif | 1 → 0..N ExigenceCompetence |
| `ExigenceCompetence` | ID, profil, compétence, classification | exactement 1 profil, 1 compétence, 1 classification |
| `Formation` | ID, code, intitulé, objectifs, description, durée indicative, état | 1 → 0..N Session ; 1 → 0..N FormationCompetence |
| `FormationCompetence` | ID, formation, compétence | exactement 1 formation et 1 compétence |
| `Session` | ID, référence, formation, état, capacité facultative, modalités | 1 formation ; 0..N créneaux, intervenants, participations |
| `CreneauSession` | ID, session, début, fin, lieu éventuel | exactement 1 session |
| `Intervenant` | ID, nom, prénom, coordonnées professionnelles, actif | 0..N SessionIntervenant ; 0..1 compte lié |
| `SessionIntervenant` | ID, session, intervenant | exactement 1 session et 1 intervenant |
| `Collaborateur` | ID, identifiant professionnel, nom, prénom, actif | 0..N Participation ; aucun ProfilEmploi |
| `Participation` | ID, session, collaborateur, état | exactement 1 session et 1 collaborateur |

## Contraintes de relation

- `ProfilEmploi × Competence` : une exigence unique, avec une classification.
- `Formation × Competence` : une association simple et unique, sans niveau de couverture.
- `Session × Intervenant` : une affectation unique, plusieurs intervenants possibles.
- `Session × Collaborateur` : une participation unique, même après désistement et réactivation.
- `Session → CreneauSession` : zéro créneau en Brouillon, au moins un avant Planifiée.
- **Aucune** relation `Collaborateur ↔ ProfilEmploi` dans le MVP.

## Références

- [Modèle expliqué](../explanation/modele-metier.md)
- [Règles et invariants](invariants-regles.md)
- [Backlog](backlog-mvp.md)
