---
title: "Validation transversale du 13 novembre 2026"
created: 2026-11-13
updated: 2026-11-13
status: accepted
type: reference
---

# Validation transversale du 13 novembre 2026

## Sommaire

- [Révision et preuves](#révision-et-preuves)
- [Stories couvertes](#stories-couvertes)
- [Suivi humain](#suivi-humain)

## Révision et preuves

La révision applicative commune est `205f79bfe75129ed7c2839544d5a86f6b04def49`. Les suites complètes ont été exécutées lors de US-05.03 sur le code ensuite commité dans cette révision, conformément au [rapport de livraison](us-05-03-validation.md#stratégie-et-preuves).

Les résultats réels de cette exécution sont :

| Validation | Résultat |
|---|---|
| Génération OpenAPI, TypeScript et build Vite | Réussis |
| Maven `verify`, JUnit et PostgreSQL Testcontainers | 95 tests réussis |
| Vitest | 37 tests réussis |
| Playwright, parcours Chromium, clavier/focus et axe | 54 scénarios réussis |
| Scripts de suivi Python | 13 tests réussis |

Les trois scénarios HTTP intervenants ont également repassé après restauration des mutations temporaires, comme indiqué dans le rapport US-05.03.

Le contrôle `git diff 205f79b 422e339e886788b03049544feb6f5cd6596133e5 -- backend frontend api` est vide : la révision présentée à l’utilisateur conserve exactement ce code applicatif. Cette fiche centralise les validations déjà exécutées ; elle ne déclare pas une nouvelle exécution des suites applicatives à l’occasion de l’acceptation. Les contrôles du manifeste et des scripts de suivi sont rejoués pour l’enregistrement.

## Stories couvertes

Les suites globales comprennent les parcours des dix-huit stories déjà implémentées ci-dessous. Leur `validated_commit` est actualisé vers cette révision commune, avec leurs rapports initiaux conservés et reliés à la présente preuve. Aucun statut d’implémentation des stories suivantes n’est modifié.

| Story | Rapport |
|---|---|
| US-01.01 | [Validation](us-01-01-validation.md) |
| US-01.02 | [Validation](us-01-02-validation.md) |
| US-01.03 | [Validation](us-01-03-validation.md) |
| US-01.04 | [Validation](us-01-04-validation.md) |
| US-02.01 | [Validation](us-02-01-validation.md) |
| US-02.02 | [Validation](us-02-02-validation.md) |
| US-02.03 | [Validation](us-02-03-validation.md) |
| US-02.04 | [Validation](us-02-04-validation.md) |
| US-03.01 | [Validation](us-03-01-validation.md) |
| US-03.02 | [Validation](us-03-02-validation.md) |
| US-03.03 | [Validation](us-03-03-validation.md) |
| US-04.01 | [Validation](us-04-01-validation.md) |
| US-04.02 | [Validation](us-04-02-validation.md) |
| US-05.01 | [Validation](us-05-01-validation.md) |
| US-05.02 | [Validation](us-05-02-validation.md) |
| US-05.03 | [Validation](us-05-03-validation.md) |
| US-08.01 | [Validation](us-08-01-validation.md) |
| US-08.02 | [Validation](us-08-02-validation.md) |

## Suivi humain

La [confirmation utilisateur du 13 novembre](acceptance-2026-11-13.md) clôt les huit réserves de recette ou d’accessibilité encore ouvertes. Les acceptations antérieures sont conservées pour les autres stories. Les éléments techniques `TECH-*`, le cadrage de production et les fonctionnalités non implémentées ne sont pas clos par cet enregistrement.
