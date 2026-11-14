---
title: "Validation US-03.03 — Recherche des formations"
created: 2026-11-10
updated: 2026-11-14
status: accepted
type: reference
---

# Validation US-03.03 — Recherche des formations

## Sommaire

- [Revalidation technique du 14 novembre 2026](#revalidation-technique-du-14-novembre-2026)

- [Périmètre et critères](#périmètre-et-critères)
- [Contrat de recherche](#contrat-de-recherche)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)
- [Revalidation après correction de la modale](#revalidation-après-correction-de-la-modale)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

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

Commit validé pour la recette conjointe : `109508832577c3a80ec433c3f045201cf22592bb`.

## Revalidation après correction de la modale

Le signalement de recette du 2026-11-10 est consigné dans [DEF-019](../../../revue/defauts/2026-11-10-DEF-019-pagination-choix-masques.md). La pagination des choix agissait sur les options masquées d’un select, alors que la liste d’associations pouvait être vide. Deux sections nommées avec totaux distinguent désormais les collections ; les compétences à associer sont des lignes radio visibles, et leur pagination indique « Page X sur Y ». Le focus rejoint le titre de la collection après changement de page.

Validation : **26 tests Vitest**, TypeScript strict, build Vite et **9 parcours Playwright du catalogue réussis**, dont le nouveau scénario observé rouge avant correction (zéro association et onze choix, dix lignes puis une ligne visible). Espace, flèches, focus et absence de sélection reportée sur une autre ligne vérifiés ; zéro violation axe dans les états testés au bureau et à 375 pixels. Capture étroite inspectée visuellement. Backend et contrats inchangés depuis `1095088`, contrôle Git effectué ; les 82 tests backend de cette livraison restent la preuve de référence et ne sont pas déclarés rejoués ici.

Version disponible pour recette sur `http://localhost:8080/`, JAR de SHA-256 `20160f61d6548ddcc71af23e3773fa73f44248c7d72599057d88d149379743fd`. Le serveur Chromium partagé est arrêté après validation. La recette métier et les examens humains d’accessibilité restent ouverts pour les deux stories.

Commit du correctif validé : `ec924794f2b1c478bb155aaaa28a3fdfb263a9bf`.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

L’acceptation humaine antérieure est conservée dans le manifeste.

## Revalidation technique du 14 novembre 2026

Le code applicatif `8aa353c5fdf8471a646475082526e9cbbb972903` a été revalidé par les suites complètes backend (105 tests), Vitest (43 tests), scripts (13 tests) et les 59 scénarios Chromium distincts. Le [rapport commun du 14 novembre](validation-stories-2026-11-14.md) détaille les commandes, l’interruption par signal de la longue commande navigateur et le lot de complément réussi. `mise run check` confirme les versions locales et l’accès aux services partagés.

Cette entrée renouvelle uniquement la preuve technique. Les recettes humaines déjà consignées conservent leur périmètre historique ; les huit nouvelles stories restent à recetter séparément.
