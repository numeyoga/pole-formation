---
title: "Développement et validation de US-02.01"
created: 2026-11-08
updated: 2026-11-13
status: accepted
type: reference
---

# Développement et validation de US-02.01

## Sommaire

- [Périmètre](#périmètre)
- [Critères et décisions](#critères-et-décisions)
- [Stratégie et résultats](#stratégie-et-résultats)
- [Limites et suivi](#limites-et-suivi)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

API `/api/referentiels/profils-emploi` et panneau Lit pour gestionnaire et administrateur fonctionnel : création, consultation paginée des actifs et inactifs, modification du code, libellé et description, désactivation confirmée, exigences historiques consultables. Aucun lien collaborateur-profil, aucune compétence acquise individuellement.

Le raccordement POST/GET des exigences est minimal. Le formulaire d’association et le reclassement relèvent de US-02.03 ; la configuration complète des classifications de US-02.02. Les exigences gardent leurs identités et références ; leurs libellés affichés sont ceux des référentiels courants.

## Critères et décisions

| Critère | Preuve exécutée |
|---|---|
| Profil enregistré consultable | HTTP et parcours formulaire → liste |
| Modification du libellé sans perte d’exigences | HTTP : mêmes identifiants et références ; navigateur : compétence et classification encore visibles |
| Profil inactif : nouvel ajout refusé, historique conservé | HTTP : tentative sur une nouvelle compétence ; GET historique inchangé ; navigateur : exigences après désactivation |

REF-04 a été validée explicitement pendant cette implémentation. Code unique sans casse, réservé après désactivation ; code et libellé requis, bornés à 64/200 caractères, espaces externes retirés. Description facultative, 4000 caractères maximum. Modification et désactivation exigent la version lue. Voir [ADR 0014](../../decisions/ADR-0014-job-profiles.md).

## Stratégie et résultats

Administration récupérable : criticité moyenne, faible complexité ; droits, conservation et concurrence : risque élevé, testé aux frontières HTTP et PostgreSQL réel. Hypothèse prudente issue des conventions existantes, sans déclaration de criticité humaine supplémentaire. JUnit/Testcontainers pour règles et persistance, Vitest pour contrat HTTP et mapping de présentation, Playwright/axe pour formulaires, états réseau, pagination, clavier, focus et petits écrans. Aucun mock de module interne, aucune dépendance ajoutée, aucune exception de test de détail interne. Les conventions Java/Lit du projet s’appliquent, le skill de tests n’ayant pas de référence propre à cette pile.

Premier test HTTP observé rouge sur 404 avant implémentation. Cas spécifiés ajoutés par groupes avec le code ; contrôles de mutation ciblés sur droits, activation et concurrence. Le premier test de refus après désactivation réutilisait une exigence existante : la contrainte de doublon masquait l’absence du garde d’activation. La mutation l’a révélé ; le test utilise désormais une autre compétence et vérifie le motif du refus. Le défaut est tracé dans [DEF-011](../../../revue/defauts/2026-11-08-DEF-011-test-garde-activation.md).

Validations exécutées sur l’hôte avec Mise, Java 27, PostgreSQL 18 Testcontainers/Podman et Chromium distant :

- Génération OpenAPI, TypeScript strict et build frontend/JAR réussis.
- `mise run test:frontend` : **10 tests Vitest réussis**, dans 7 fichiers. Le mapping, la pagination du contrat HTTP, les erreurs de champ et l’expiration de session du nouvel adaptateur sont couverts. L’inversion du statut est détectée ; les sources restaurées passent de nouveau.
- Maven `verify` : **58 tests réussis**, aucun échec, erreur ou test ignoré. Migrations testées sur PostgreSQL réel, incluant V6/V7 et leur application à la base locale existante. Cinq scénarios HTTP de profils couvrent bornes et normalisation, autorisations, CSRF, versions, concurrence, doublons sans casse après désactivation, exigences et références inactives. Les autres scénarios sont les régressions existantes.
- **4 mutations serveur détectées par assertion** : suppression de l’autorisation, du garde de profil actif, du contrôle de version, et de l’index unique de code. Chaque source est restaurée dans un bloc `finally`. La suite ciblée des cinq scénarios est rejouée après la dernière restauration.
- Playwright : **26 parcours Chromium réussis**, sans retry, dont quatre propres aux profils. Les critères de conservation sont vérifiés avec une vraie exigence, une compétence et une classification référencées. Création, description, doublon, modification, désactivation, concurrence/rechargement, réseau, pagination et interdiction intervenant sont couverts.
- Clavier : navigation vers le titre, Tab/Shift+Tab dans le formulaire, focus initial, Escape/restitution sur les deux dialogues, focus après succès ou conflit et défilement du tableau au clavier à 375 pixels.
- Axe : aucune violation dans les états testés de la nouvelle interface, dont formulaire à 1440 et 375 pixels, erreur de doublon, conflit et liste désactivée. Captures du formulaire desktop/mobile et de la liste inspectées. Aucun débordement du document à 375 pixels.
- Python : **12 tests réussis**. Contrôle du manifeste de suivi, liens locaux des documents modifiés et `git diff --check` réussis.

Les tests ne couvrent pas l’éditeur d’exigences, l’administration des classifications ou l’affectation à un collaborateur, absents du périmètre de cette story. Aucune nouvelle bibliothèque ni outil de test ajouté ; les outils déjà présents suffisent.

## Limites et suivi

Le représentant du projet a accepté la livraison locale le 2026-11-08 : « je valide », après remise en service sur 8080. Voir la [preuve d’acceptation](acceptance-2026-11-08.md#validation-de-us-0201). Les scénarios humains individuels ne sont pas détaillés. L’examen d’accessibilité avec lecteur d’écran et zoom navigateur 200 % reste à effectuer ; axe et les scénarios clavier automatisés ne démontrent pas à eux seuls WCAG AA.

La livraison est versionnée dans `0b538a48a3f35a7df065dba25e1c4b184c7ac455`. Ce commit contient le code validé par les exécutions rapportées ci-dessus, sans modification applicative entre ces validations et le commit. Le manifeste déclare `implementation: complete` et rattache la preuve technique à cette révision, conformément au [guide de suivi](../../how-to/track-development.md). L’acceptation métier est enregistrée ; seul l’examen humain d’accessibilité non détaillé reste suivi séparément.

[DEF-010](../../../revue/defauts/2026-11-08-DEF-010-import-composant.md) trace l’import de composant supprimé à la compilation, corrigé par un import à effet de bord et couvert par le parcours de navigation.

[DEF-012](../../../revue/defauts/2026-11-08-DEF-012-jar-remplace-en-execution.md) trace le serveur ancien laissé sur 8080 après reconstruction du JAR. Après redémarrage, accueil et assets HTTP 200, connexion gestionnaire 204 et API des profils 200 ont été vérifiés avant l’acceptation utilisateur.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

La [confirmation du représentant du projet](acceptance-2026-11-13.md) clôt la recette et les réserves d’accessibilité encore mentionnées dans ce rapport. Les protocoles humains individuels ne sont pas détaillés.
