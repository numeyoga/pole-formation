---
title: "ADR 0017 — Catalogue et cycle de vie des formations"
created: 2026-11-09
updated: 2026-11-09
status: accepted
type: decision
---

# ADR 0017 — Catalogue et cycle de vie des formations

## Sommaire

- [Contexte et confirmations](#contexte-et-confirmations)
- [Décision](#décision)
- [Transition des sessions historiques](#transition-des-sessions-historiques)
- [Conséquences](#conséquences)

## Contexte et confirmations

US-03.01 demande création, modification, archivage et réactivation sans altération des sessions et participations historiques. RG-FOR-01 et RG-FOR-02 sont validées. Les conventions de champs et le cycle proposés dans la baseline nécessitaient une confirmation.

Le 2026-11-09, l’utilisateur a confirmé « Oui, reprendre ces conventions », « Oui, appliquer ce cycle » et « Oui, conserver l’historique sans correspondance inventée » aux questions de cadrage de cette story. Ces réponses valident REF-07 et la transition décrite ci-dessous.

## Décision

Le module `formations` conserve un domaine indépendant de Spring/JPA, un service qui vérifie le rôle courant et un port de persistance. Le contrôleur fournit des DTO spécifiques ; l’adaptateur PostgreSQL utilise JdbcClient et le journal existant. Les gestionnaires et administrateurs disposent de `WRITE_REFERENTIAL` ; les intervenants n’administrent pas le catalogue.

Code obligatoire, 1–64 caractères, espaces externes retirés, unicité sans casse y compris après archivage. Intitulé obligatoire, 1–200 caractères. Objectifs et description facultatifs, normalisés et limités à 4 000 caractères chacun. Durée indicative facultative, en minutes entières strictement positives ; plafond technique PostgreSQL de 2147483647. Durée et version JSON utilisent une conversion exacte, refusant fractions et dépassements.

Le cycle est `Brouillon → Active → Archivée → Active`. L’archivage est aussi possible depuis Brouillon. Une réactivation rend la formation Active, y compris si elle avait été archivée depuis Brouillon. Les modifications de champs conservent l’état ; les transitions sont explicites. Activation et réactivation vérifient les champs obligatoires, l’unicité et la cohérence structurelle ; aucune nouvelle règle métier non définie n’est inventée.

Le code reste réservé. La migration V10 introduit le catalogue et la référence de formation des sessions. Chaque modification ou transition requiert la version affichée, avec verrou sur la formation et conflit 409 si périmée. Les index et contraintes PostgreSQL garantissent l’unicité et les bornes stockées. Les créations, modifications et transitions de formations sont auditées avant/après, dans la même transaction ; une panne de journal annule le changement. Le journal accepte le type `FORMATION`.

## Transition des sessions historiques

Les sessions antérieures n’ont pas de correspondance de formation connue. L’utilisateur a explicitement accepté leur conservation avec référence temporairement nulle, sans création de formation artificielle ni modification de leurs créneaux, participations ou états. Cette exception transitoire à la cible INV-07 sera résolue avec US-05.01, après identification des rattachements réels.

Toute nouvelle session créée par le raccordement applicatif `POST /api/formations/{id}/sessions` référence une formation Active et commence en Brouillon. La formation est verrouillée avec le même mécanisme que pour l’archivage ; le contrôle d’activation et l’insertion sont atomiques. La consultation des anciennes sessions et participations ne dépend pas de l’état de la formation. La planification complète reste US-05.01 ; aucun formulaire de planification n’est anticipé dans cette livraison.

## Conséquences

Un panneau Lit présente le catalogue paginé, les formulaires natifs, les confirmations d’état et les sessions rattachées. Le backend conserve l’autorité sur les règles. L’adaptateur HTTP transforme les DTO OpenAPI en modèles de présentation. Aucun framework, dépendance, compétence individuelle ni attribution de profil n’est ajouté.

Les associations formation-compétence restent US-03.02 et la recherche du catalogue reste US-03.03. L’identité de formation ne change jamais lors d’un archivage ou d’une réactivation.

Références : [contrat](../../api/formations.openapi.yaml), [rapport](../reference/quality/us-03-01-validation.md), [registre métier](../functional-baseline-v1.0/reference/decisions-metier.md).
