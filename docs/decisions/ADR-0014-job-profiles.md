---
title: "ADR 0014 — Administration des profils d’emploi"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0014 — Administration des profils d’emploi

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-02.01 exige la maintenance des profils et la conservation des exigences, même après désactivation. REF-04 valide explicitement la convention des codes des référentiels existants. Les classifications et l’édition complète des exigences relèvent de US-02.02 et US-02.03.

## Décision

Le module `profils` regroupe le domaine `JobProfile`, son service, le port `ProfileStore` et ses adaptateurs REST/PostgreSQL. Le domaine reste indépendant de Spring et JPA. Code et libellé sont obligatoires et bornés à 64 et 200 caractères ; description facultative, normalisée en chaîne vide et bornée à 4000 caractères. Les espaces externes sont retirés.

La migration V6 crée les profils et exigences, ajoute l’activation des classifications existantes et impose les clés étrangères et l’unicité du couple profil-compétence. La migration V7 impose l’unicité des codes de profil via `lower(code)`, même après désactivation. V7 est séparée car V6 avait déjà été appliquée aux données locales avant l’arbitrage REF-04.

Modification et désactivation exigent une version. Le verrou pessimiste sérialise les écritures ; une version périmée renvoie 409. Les modifications ne changent ni l’identité, ni l’activation, ni les exigences. La désactivation ne supprime aucun lien.

Un raccordement minimal POST/GET des exigences rend les critères de conservation et de refus vérifiables par HTTP. Le POST verrouille le profil, la compétence via `CompetencyAvailability`, puis la classification, et exige leur activation dans la transaction qui insère le lien. Le GET reste accessible lorsque les références sont inactives. Aucune sémantique de classification ni valeur métier n’est inventée.

L’interface Lit présente la liste paginée, la description, les exigences historiques et deux dialogues natifs. Un adaptateur OpenAPI transforme les réponses en modèles de présentation. Le serveur contrôle chaque opération pour les gestionnaires et administrateurs fonctionnels ; l’intervenant n’y accède pas.

## Conséquences

Aucune suppression, réactivation, affectation de collaborateur ou mesure de compétence individuelle n’est exposée. L’interface de configuration des classifications et celle d’association/reclassement des exigences restent dans leurs stories respectives. Les classifications fictives existantes permettent seulement le raccordement local de US-02.01.

Références : [contrat](../../api/profiles.openapi.yaml), [REF-04](../functional-baseline-v1.0/reference/decisions-metier.md), [rapport](../reference/quality/us-02-01-validation.md).
