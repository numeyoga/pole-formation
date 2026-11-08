---
title: "Développement et validation de US-01.02"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Développement et validation de US-01.02

## Sommaire

- [Périmètre actuel](#périmètre-actuel)
- [Règles validées et critères](#règles-validées-et-critères)
- [Validation technique](#validation-technique)
- [Travail restant](#travail-restant)

## Périmètre actuel

US-01.02 est acceptée pour la livraison locale. Le backend et l’interface permettent création, consultation paginée et filtrée, modification et désactivation des sous-domaines par gestionnaires et administrateurs fonctionnels.

La nouvelle consultation `GET /api/referentiels/sous-domaines` expose une page de sous-domaines avec l’identité, le code, le libellé et le statut du domaine parent. Le filtre `domainId` porte sur l’identifiant exact ; un parent inconnu produit une page vide. Le tri est défini par libellé sans casse puis identifiant. Les gestionnaires et administrateurs fonctionnels ont accès à cette consultation, avec vérification du compte à chaque opération.

La section « Sous-domaines » comprend des dialogues natifs, des erreurs de champ, le refus explicite des doublons et le rechargement d’une version périmée. Le parent est sélectionné à la création puis présenté en lecture seule. L’activation des choix de création provient du serveur ; le filtre historique inclut les parents désactivés.

## Règles validées et critères

REF-02 est validée explicitement le 2026-11-08 :

- Code de 1 à 64 caractères, espaces externes retirés, unicité globale sans casse conservée après désactivation. Libellé de 1 à 200 caractères, espaces externes retirés.
- Domaine parent fixé à la création ; code et libellé modifiables sous réserve d’unicité.

| Critère US-01.02 | Preuve |
|---|---|
| 1 — Création sous exactement un domaine actif | `manager_can_create_edit_and_deactivate_a_subdomain_without_losing_competencies`, parent stable après modification |
| 2 — Rattachement sous un domaine inactif refusé | `subdomains_validate_fields_versions_and_active_parents` et compatibilité de l’ancien POST imbriqué |
| 3 — Désactivation conservant compétences et liens historiques | Cycle HTTP complet et parcours navigateur avec une compétence rattachée |

La migration V4 conserve identités, parents et libellés des lignes héritées et ajoute codes techniques, activation et version. Le raccordement minimal des compétences démontre la conservation de leur identité et du lien au sous-domaine. Il ne livre pas l’administration complète de US-01.03 et ne simule aucun lien vers des profils ou formations non développés.

## Validation technique

L’administration du référentiel est un comportement métier récupérable ; son contrôle d’accès relève de la sécurité. Tests HTTP avec PostgreSQL Testcontainers, mapping TypeScript et parcours navigateur constituent les frontières observables. Aucun mock de module interne. Les données SQL directes sont réservées aux fixtures et aux tests de migration. Le premier test HTTP de consultation a échoué avec 404 au lieu de 200 ; celui de création avec 405 au lieu de 201 avant implémentation.

Les tests HTTP vérifient cycle complet, bornes de champs, parent obligatoire et immuable, versions absentes ou périmées, unicité globale après désactivation, pagination et filtre exact, formats invalides, accès anonyme/intervenant, révocation immédiate des droits et CSRF sur les écritures. Deux créations simultanées du même code donnent exactement un succès et un conflit. Le test de migration V3→V4 vérifie conservation des identités, parents, libellés et stabilité des codes au redémarrage. Génération OpenAPI, TypeScript strict, build Vite et quatre tests Vitest de mapping réussis.

Maven `clean verify` : **40 tests réussis**, aucun échec ni test ignoré. Les **16 mutations serveur** ont été détectées en deux groupes : dix contrôles existants et six propres aux sous-domaines. Ces six contrôles détectent suppression de l’autorisation, inversion du filtre parent, annulation du décalage de pagination, suppression du contrôle de version, changement de parent accepté et rattachement à un sous-domaine inactif. Les sources restaurées ont passé la validation complète.

Playwright Chromium : **15 parcours réussis**, sans retry, dont quatre pour les sous-domaines. Les parcours ont d’abord échoué sur l’absence de la section puis du filtre dans les versions précédentes. Ils couvrent création/modification/désactivation, conservation d’une compétence, doublon avec erreur de champ, parent fixé, édition périmée puis rechargement, filtre sur domaine actif ou inactif, état vide, reprise réseau, pagination, accès au titre depuis la navigation au clavier et défilement horizontal au clavier à 375 pixels.

Axe ne signale aucune violation sur les états contrôlés, notamment tableau, formulaire de création, erreur de doublon et dialogue étroit. Les captures du tableau et du formulaire ont été inspectées à 1440 et 375 pixels ; le document ne déborde pas horizontalement et le tableau défile dans son conteneur. Le focus initial, Escape et restitution du focus sont contrôlés. Une validation humaine complète de l’accessibilité et un audit AAA ne sont pas affirmés.

Les sept tests du générateur de suivi, la validation de ses métadonnées et `git diff --check` réussissent. L’erreur de convention CSRF interceptée par TypeScript est corrigée et tracée dans [DEF-006](../../../revue/defauts/2026-11-08-DEF-006-contrat-csrf.md) : aucun autre contrat touché, génération et typage strict conservés comme prévention.

## Travail restant

Le représentant du projet a confirmé « je valide. » après mise à disposition de la livraison locale et du bilan technique : voir l’[acceptation enregistrée](acceptance-2026-11-08.md#validation-de-us-0102). Le commit de livraison et la révision validée sont référencés dans `tracking/stories.json`.

Les codes techniques hérités `MIG-…` restent remplaçables par des codes métier uniques. L’ancien POST par seul libellé reste compatible et reçoit également un code technique ; toutes les écritures passent par le nouveau service.

L’administration complète des compétences reste US-01.03. La suppression physique, la réactivation et le changement de parent des sous-domaines ne sont pas exposés.

Références : [contrat](../../../api/subdomains.openapi.yaml), [ADR 0011](../../decisions/ADR-0011-subdomain-reference.md), [backlog MVP](../../functional-baseline-v1.0/reference/backlog-mvp.md), [suivi du développement](../development-tracking.md).
