---
title: "Livraison et validation de US-08.02"
created: 2026-11-08
updated: 2026-11-13
status: accepted
type: reference
---

# Livraison et validation de US-08.02

## Sommaire

- [Périmètre](#périmètre)
- [Traçabilité des critères](#traçabilité-des-critères)
- [Validation technique](#validation-technique)
- [Recette et limites](#recette-et-limites)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

La tranche ajoute le journal consultable par gestionnaires et administrateurs, les instantanés structurés avant/après et les raccordements transactionnels aux changements de créneau, remplacement d’affectations et désistement/réactivation. Les corrections de présence et changements de rôle existants utilisent le même journal. Auteurs, dates, cibles et identité de participation sont conservés.

La livraison complète est rattachée au commit US-08.02 référencé dans `tracking/stories.json`. L’[accord utilisateur du 2026-11-08](acceptance-2026-11-08.md#validation-métier-de-us-0802), suivi d’une confirmation finale de passage à la story suivante, clôture la livraison locale. Les limites des contrôles humains non détaillés restent consignées.

Le journal se filtre par type, identifiant d’objet et session, puis se parcourt par curseur. Les intervenants ne reçoivent ni écran ni données du journal. Les conventions nécessaires sont validées sous AUD-02 ; les autres propositions de la baseline ne sont pas réputées arbitrées.

## Traçabilité des critères

| Critère US-08.02 | Preuve |
|---|---|
| 1 — Correction après clôture : avant/après, auteur, date | Test HTTP `presence_requires_last_slot_and_closed_correction_requires_admin_and_audit`, consultation par API et parcours navigateur du journal |
| 2 — Créneau planifié modifié audité | `planned_slot_changes_are_audited_and_rejected_changes_leave_no_success_event` |
| 3 — Anciennes et nouvelles affectations | `replacement_preserves_old_and_new_assignments_and_changes_actual_scope` |
| 4 — Désistement et réactivation, même participation | `withdrawal_and_reactivation_share_the_same_participation_and_can_be_paginated` |
| 5 — Refus d’accès au journal | `audit_is_readable_by_management_and_denied_to_instructors`, parcours navigateur intervenant |
| 6 — Aucun faux succès en cas de refus | Tests de refus de planning, capacité et transition ; panne d’audit provoquée puis rollback vérifié par API |

## Validation technique

Sécurité et intégrité : tests à la frontière HTTP avec PostgreSQL réel, tests du domaine pour la matrice d’accès et les règles d’intervalle/capacité. Aucun mock d’un module du projet. Le premier test du journal a échoué avec 404 au lieu de 200 avant implémentation.

Maven `clean verify`, puis `verify` après ajout du dernier scénario concurrent : **24 tests réussis**, aucun échec ni test ignoré. Les tests concurrents de deux réactivations pour une dernière place et de deux modifications de créneaux incompatibles obtiennent chacun un seul succès et un seul événement. Un test distinct prouve que Présente et Absente continuent à consommer une place. Les données de migration V1→V2 sont vérifiées sur une base temporaire distincte, y compris des cibles historiques sans relation courante.

Sept mutations ciblées ont été détectées par des assertions : retrait du contrôle d’affectation, élévation du gestionnaire, retrait de CSRF, retrait de la permission de lecture du journal, retrait de la transaction de créneau, retrait du contrôle de capacité et retrait du contrôle de chevauchement. Les sources restaurées ont été compilées et validées depuis un build propre.

Les fixtures sont préparées directement en base de test ; les comportements et effets sont contrôlés par les interfaces publiques, sauf les assertions historiques d’audit de US-08.01 et l’injection d’une panne via trigger, nécessaires à la preuve d’atomicité. Aucun changement n’est réalisé dans la base de développement par ces tests serveur.

Génération OpenAPI, TypeScript strict, build Vite et les deux tests Vitest de mapping : réussis.

Playwright Chromium : **7 parcours réussis**, sans retry, contre l’application réelle. Ils couvrent les parcours de US-08.01, la correction d’une présence suivie dans le journal, les filtres, l’état vide, l’absence de journal pour l’intervenant, l’erreur réseau puis reprise et la pagination sans doublon. Axe ne signale aucune violation sur le journal rempli ou vide ; Enter et le focus après filtrage/pagination sont vérifiés.

Les captures du journal à 1440 et 375 pixels ont été inspectées ; les libellés, cibles et instantanés restent lisibles et se replient. L’absence de débordement horizontal a été contrôlée à 1440, 1024 et 375 pixels. Les contrôles humains de zoom et de lecteur d’écran ne sont pas déclarés exécutés.

## Recette et limites

La recette métier de US-08.02 est validée par le représentant du projet. La validation AA précédemment fournie pour US-08.01 ne vaut pas validation du nouvel écran. Les limites d’un scan automatisé et les contrôles humains d’accessibilité restent applicables ; le zoom à 200 % et le lecteur d’écran ne sont pas déclarés exécutés.

Les mutations de créneau, d’affectations et de participation sont raccordées à l’API et testées ; leurs formulaires de gestion complets appartiennent aux stories des lots suivants. Aucune création de session ni gestion exhaustive des intervenants ou inscriptions n’est annoncée livrée ici.

La migration de la base locale s’effectue au lancement du profil dev, avec conservation des événements antérieurs. La rétention, l’export, le scellement du journal, Docker et la production ne sont pas validés par cette livraison.

Références : [ADR 0009](../../decisions/ADR-0009-transactional-audit.md), [contrat](../../../api/audit.openapi.yaml), [guide de lancement](../../how-to/run-local-app.md).


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

L’acceptation humaine antérieure est conservée dans le manifeste.
