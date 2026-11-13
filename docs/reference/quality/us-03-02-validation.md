---
title: "Validation US-03.02 — Associations formations et compétences"
created: 2026-11-10
updated: 2026-11-13
status: accepted
type: reference
---

# Validation US-03.02 — Associations formations et compétences

## Sommaire

- [Périmètre](#périmètre)
- [Persistance et concurrence](#persistance-et-concurrence)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)
- [Revalidation pour recette conjointe](#revalidation-pour-recette-conjointe)
- [Correction de la pagination des choix](#correction-de-la-pagination-des-choix)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

Depuis chaque formation du catalogue, le dialogue « Compétences de la formation » présente les liens existants et leur statut courant. La recherche paginée par code ou libellé propose les compétences actives. L’association ne comporte ni classification, ni niveau, ni acquisition individuelle (DEC-03, INV-06, INV-15, INV-16).

| Critère | Comportement |
|---|---|
| Formation et compétence actives | Création du lien sans niveau de maîtrise |
| Couple déjà présent | Refus HTTP 409, y compris lors de créations concurrentes |
| Compétence inactive | Refus HTTP 409 ; liens antérieurs consultables |
| Formation Brouillon ou Archivée | Refus d’une nouvelle association ; consultation conservée |

Lecture et création sont réservées aux gestionnaires et administrateurs fonctionnels. La création exige le jeton CSRF de la session. Le [contrat OpenAPI](../../../api/formations.openapi.yaml) expose les listes paginées et les erreurs. Les composants Lit consomment des modèles de présentation par l’adaptateur généré.

## Persistance et concurrence

V11 ajoute `formation_competency`, avec identifiant stable, deux références obligatoires et contrainte unique du couple. Aucun effacement en cascade. Archivage, réactivation et désactivation ne modifient pas cette table.

L’insertion s’effectue dans une transaction verrouillant la formation puis la compétence par le port `CompetencyAvailability` déjà utilisé par les profils. Les transitions d’état emploient ces mêmes verrous : la vérification et l’écriture ne peuvent être séparées par une désactivation concurrente. L’unicité reste garantie par PostgreSQL. Aucun nouvel invariant ni nouvelle dépendance n’est introduit ; les règles acceptées de la baseline s’appliquent.

Les listes des liens et des choix sont paginées (20 par défaut, maximum 100, interface par 10). Le tri est stable par libellé sans casse puis identifiant ; la recherche utilise une sous-chaîne littérale, y compris `%` et `_`. La consultation inclut les compétences devenues inactives.

## Stratégie et preuves

Comportement métier récupérable : criticité moyenne, complexité faible ; frontières de sécurité traitées comme critiques selon les conventions existantes. Tests JUnit HTTP sur PostgreSQL Testcontainers, Vitest sur les mappings et requêtes, Playwright sur le dialogue natif, le clavier et axe. Premier scénario HTTP observé rouge (201 attendu, 404 reçu), puis implémenté ; les autres exemples des critères sont écrits avec le code. Aucun mock des modules internes, aucune dépendance ajoutée, aucune exception de test en boîte blanche.

- Backend : `mise exec -- bash -c 'cd backend && ./mvnw -q verify'` : **79 tests réussis**, dont **63 scénarios HTTP**, avec PostgreSQL Testcontainers. Après restauration des mutations, les 63 scénarios HTTP et l’assemblage du JAR sont repassés.
- Contrôle de mutation manuel : retrait séparé du garde de formation active, puis du contrôle de compétence active. Le scénario d’historique échoue à chaque fois (409 attendu, 201 reçu), sur les lignes correspondant aux deux refus. Sources restaurées, suite HTTP verte. Les sources temporaires et journaux sont dans `/tmp`, hors dépôt.
- Frontend : génération OpenAPI, TypeScript strict, build Vite et **25 tests Vitest réussis**. Les tests de mapping vérifient aussi les liens inactifs et le corps sans niveau de maîtrise avec CSRF.
- Playwright : **41 parcours réussis** sur la suite complète, dont les **2 nouveaux parcours** de cette story. Après ajustement des fixtures (réutilisation du domaine de démonstration et convention de codes commune au catalogue), les deux nouveaux parcours sont repassés. Création au clavier, doublon, désactivation entre sélection et validation, archivage et historique, pagination des liens et choix, panne réseau et reprise, Tab/Shift+Tab, Enter, Escape et restitution du focus.
- Axe : aucune violation dans les états de doublon, formulaire étroit et historique archivé. Largeur du dialogue vérifiée à 2048, 1440, 1024 et 375 pixels ; absence de débordement du document à 375 pixels.
- Python : **13 tests réussis** pour les scripts. Contrôle du manifeste et `git diff --check` réussis.

La capture du formulaire en erreur à 375 pixels a été inspectée visuellement : contenu et actions lisibles, labels visibles, dialogue contenu dans le viewport.

Le premier passage axe a détecté [DEF-018](../../../revue/defauts/2026-11-10-DEF-018-nom-accessible-competences-formation.md), nom accessible du bouton ne reprenant pas tout le texte visible. Le nom accessible et le texte visible utilisent désormais la même ressource ; le parcours et axe passent après correction. Les premiers essais des nouveaux parcours ont aussi nécessité de rafraîchir le catalogue après création des fixtures par API, et de définir les assertions de tabulation depuis un contrôle précis.

## Limites et recette

Recette métier humaine de cette story et examen humain d’accessibilité (lecteur d’écran, zoom navigateur réel à 200 %) restent à effectuer. Les contrôles axe et clavier automatisés ne démontrent pas à eux seuls WCAG AA. Données fictives locales uniquement. La recherche des formations est désormais couverte par [US-03.03](us-03-03-validation.md).

La livraison initiale utilisait le JAR de SHA-256 : `8321fc8572874cd734ee1af17f30ccaf53d17fa7cd94f322206ac9060e633473`. Le serveur PostgreSQL reste actif pour l’application ; le serveur Chromium partagé est arrêté après validation.

Livraison initiale validée : `4541bfb4e557d2e54e6b507505dc71e4f27bab1d`. La recette humaine reste requise ; aucune acceptation utilisateur n’est déduite des tests automatisés.

## Revalidation pour recette conjointe

Le 2026-11-10, l’utilisateur a demandé d’enchaîner US-03.03 et de valider les deux stories ensuite. Aucune acceptation humaine n’est enregistrée. Les parcours des associations sont rejoués avec la recherche du catalogue : **82 tests backend**, dont **66 scénarios HTTP**, **26 tests Vitest**, **8 parcours Playwright du catalogue** (dont les deux parcours d’association) et **13 tests Python** réussis. Axe et les scénarios clavier du dialogue passent à nouveau. Voir les [preuves de US-03.03](us-03-03-validation.md).

La version proposée pour les deux recettes est disponible sur `http://localhost:8080/`, avec le JAR de SHA-256 `c75d37eb21f38bd08bdf807c59e3e4ca006f82c0c9a963baa6e2e1e05689c084`. Les contrôles humains restant à effectuer sont inchangés.

Commit validé pour la recette conjointe : `109508832577c3a80ec433c3f045201cf22592bb`.

## Correction de la pagination des choix

Le signalement de recette du 2026-11-10 est consigné dans [DEF-019](../../../revue/defauts/2026-11-10-DEF-019-pagination-choix-masques.md). La pagination des choix agissait sur les options masquées d’un select, alors que la liste d’associations pouvait être vide. Deux sections nommées avec totaux distinguent désormais les collections ; les compétences à associer sont des lignes radio visibles, et leur pagination indique « Page X sur Y ». Le focus rejoint le titre de la collection après changement de page.

Validation : **26 tests Vitest**, TypeScript strict, build Vite et **9 parcours Playwright du catalogue réussis**, dont le nouveau scénario observé rouge avant correction (zéro association et onze choix, dix lignes puis une ligne visible). Espace, flèches, focus et absence de sélection reportée sur une autre ligne vérifiés ; zéro violation axe dans les états testés au bureau et à 375 pixels. Capture étroite inspectée visuellement. Backend et contrats inchangés depuis `1095088`, contrôle Git effectué ; les 82 tests backend de cette livraison restent la preuve de référence et ne sont pas déclarés rejoués ici.

Version disponible pour recette sur `http://localhost:8080/`, JAR de SHA-256 `20160f61d6548ddcc71af23e3773fa73f44248c7d72599057d88d149379743fd`. Le serveur Chromium partagé est arrêté après validation. La recette métier et les examens humains d’accessibilité restent ouverts pour les deux stories.

Commit du correctif validé : `ec924794f2b1c478bb155aaaa28a3fdfb263a9bf`.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

L’acceptation humaine antérieure est conservée dans le manifeste.
