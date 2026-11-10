---
title: "Validation US-03.03 — Recherche des formations"
created: 2026-11-10
updated: 2026-11-10
status: accepted
type: reference
---

# Validation US-03.03 — Recherche des formations

## Sommaire

- [Périmètre et critères](#périmètre-et-critères)
- [Contrat de recherche](#contrat-de-recherche)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)

## Périmètre et critères

Le catalogue propose un champ natif de recherche par code ou intitulé, une action de recherche et une action d’effacement. La consultation conserve les descriptions, objectifs, durées, états, associations de compétences et sessions accessibles dans les lignes et leurs détails existants.

| Critère | Couverture |
|---|---|
| Recherche par code ou intitulé | Filtrage côté serveur, total et pagination calculés sur les correspondances |
| Formation active sans session | Résultat visible et message explicite dans le détail des sessions |
| Formation archivée | Description conservée et associations antérieures consultables, y compris les compétences devenues inactives |

Les permissions acceptées du catalogue restent celles du gestionnaire et de l’administrateur fonctionnel. L’intervenant reste dans son périmètre de sessions. Aucune permission ni nouvelle règle de couverture n’est introduite.

## Contrat de recherche

`GET /api/formations` accepte `q` facultatif, vide par défaut. Recherche par sous-chaîne littérale dans le code ou l’intitulé, sans casse, après retrait des espaces externes, avec une limite de 200 caractères. `%` et `_` sont traités comme des caractères littéraux. Tous les états sont inclus, sans dépendre de l’existence d’une session. Une recherche vide retourne le catalogue complet. Tri stable par code sans casse puis identifiant ; pagination inchangée.

Le [contrat OpenAPI](../../../api/formations.openapi.yaml) est régénéré pour le client TypeScript. L’adaptateur transmet le filtre et mappe les résultats en modèles de présentation ; aucun filtrage métier n’est exécuté dans Lit. Aucune migration ni dépendance supplémentaire n’est nécessaire.

La recherche soumise reste appliquée aux pages suivantes, à l’actualisation et après une modification de formation. Saisir un autre texte sans le soumettre ne change pas ce filtre. Chaque nouvelle recherche revient à la première page. L’effacement rétablit le catalogue et remet le focus sur le champ. Les états chargement, aucun résultat et erreur réseau sont explicites.

## Stratégie et preuves

Criticité moyenne et complexité faible pour cette consultation métier récupérable, selon la stratégie des stories du catalogue. Contrôles d’accès considérés critiques ; tests HTTP avec PostgreSQL réel et rôles courants. Premier scénario HTTP observé rouge : le serveur ignorait le filtre et retournait trois formations au lieu des deux correspondances attendues. Les exemples supplémentaires sont écrits avec le code. Tests de mapping et de requête sous Vitest ; tests navigateur pour recherche, consultation, clavier, focus et axe. Aucun mock des modules internes, aucune exception de boîte blanche, aucune nouvelle bibliothèque de test.

- Backend : `mise exec -- bash -c 'cd backend && ./mvnw -q verify'` : **82 tests réussis**, dont **66 scénarios HTTP**, avec PostgreSQL Testcontainers, zéro échec et zéro test ignoré.
- Mutations manuelles : retrait de la recherche sur l’intitulé et de la limite de longueur. Les deux tests concernés échouent respectivement sur 1 résultat attendu contre 0, et 400 attendu contre 200. Sources restaurées avant la validation complète.
- Frontend : génération OpenAPI, TypeScript strict et build Vite réussis ; **26 tests Vitest réussis**, dont la transmission littérale du filtre avec pagination.
- Playwright : **8 parcours réussis** sur `formation-search.spec.ts`, `formation-competencies.spec.ts` et `formations.spec.ts`. Ils couvrent US-03.01, US-03.02 et les deux nouveaux scénarios de recherche : code et intitulé, offre active sans session, archive avec description et lien historique inactif, pagination, brouillon de recherche non soumis, actualisation et reprise réseau, nouvelle recherche depuis une autre page, résultat vide et effacement.
- Clavier et axe : Enter pour soumettre et ouvrir les détails, Tab/Shift+Tab, Escape et restitution du focus du dialogue, focus sur le champ après effacement ; aucune violation axe dans les états testés au bureau et à 375 pixels. Absence de débordement du document et capture du catalogue étroit inspectée visuellement ; le tableau garde son défilement horizontal natif déjà testé.
- Scripts : **13 tests Python réussis** ; manifeste, liens locaux de la documentation modifiée et `git diff --check` vérifiés.

La suite navigateur ciblée couvre les composants modifiés et la dépendance US-03.02 sur le même JAR. Les autres fonctionnalités disposent de leurs tests HTTP dans la validation backend complète ; la suite navigateur complète de 41 parcours a été exécutée lors de US-03.02, avant l’ajout des deux nouveaux tests de recherche. Elle n’est pas déclarée rejouée pour cette livraison.

## Limites et recette

La recette métier humaine de US-03.02 et US-03.03 est différée à la demande de l’utilisateur. Les deux stories restent à recetter ; les tests automatisés ne constituent pas une acceptation humaine. Lecteur d’écran et zoom navigateur réel à 200 % restent à examiner. Axe et un viewport étroit ne suffisent pas à démontrer WCAG AA. Données fictives locales uniquement.

Version disponible sur `http://localhost:8080/` pour la recette conjointe. SHA-256 du JAR : `c75d37eb21f38bd08bdf807c59e3e4ca006f82c0c9a963baa6e2e1e05689c084`. PostgreSQL et l’application restent actifs ; le serveur Chromium partagé est arrêté après validation.
