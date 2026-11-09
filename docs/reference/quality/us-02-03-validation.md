---
title: "Développement et validation de US-02.03"
created: 2026-11-09
updated: 2026-11-09
status: accepted
type: reference
---

# Développement et validation de US-02.03

## Sommaire

- [Périmètre](#périmètre)
- [Critères et décisions](#critères-et-décisions)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et suivi](#limites-et-suivi)

## Périmètre

Association d’une compétence classifiée depuis les profils d’emploi et reclassement d’une exigence existante. Gestionnaire et administrateur fonctionnel utilisent un dialogue natif Lit, avec recherche paginée des compétences actives et choix paginé des classifications actives. Les règles demeurent dans le backend, sans nouvelle dépendance.

## Critères et décisions

| Critère | Couverture |
|---|---|
| Profil, compétence et classification actifs | Création par API et formulaire ; références et identité restituées |
| Unicité profil-compétence | Refus 409, y compris lors de créations concurrentes ; contrainte PostgreSQL conservée |
| Reclassement vers une valeur active | PUT versionné, même identifiant et même compétence, une seule exigence |
| Concurrence | Deux reclassements d’une même version produisent 204 et 409 ; rechargement explicite dans l’interface |
| Historique | Références conservées après désactivation ; classification courante visible, sans réintroduction parmi les choix actifs |

La détection des conflits est confirmée par l’utilisateur le 2026-11-09 sous REF-06 et [ADR 0016](../../decisions/ADR-0016-profile-requirements.md). Le reclassement porte seulement sur la classification ; le couple profil-compétence demeure fixe. L’interface de filtrage des exigences est livrée par [US-02.04](us-02-04-validation.md).

## Stratégie et preuves

Association récupérable : criticité moyenne ; concurrence, permissions et conservation traitées comme risques élevés à la frontière HTTP avec PostgreSQL réel. Les choix paginés et le formulaire sont des surfaces de présentation de faible complexité ; les scénarios énumérés par la baseline sont groupés. Approche frontière d’abord pour les nouvelles routes, tests avec le code pour les mappings, parcours navigateur sur le bundle produit. Pas de test de méthode privée, ni de mock d’un module métier interne. Les doubles fetch Vitest restent limités au contrat HTTP ; Playwright interrompt le réseau pour vérifier la reprise explicite. Les outils déjà présents suffisent ; aucune dépendance ajoutée. Le skill testing ne propose pas de référence Java/Lit : les conventions Maven/JUnit/Testcontainers et Vitest/Playwright du projet s’appliquent.

Résultats locaux sur l’hôte avec Mise, Java 27 et PostgreSQL 18 sous Podman :

- Premiers tests HTTP observés en échec : choix attendus 200, reçus 400 ; reclassement attendu 204, reçu 404. Les deux fonctions passent après implémentation.
- Maven `verify` : 66 tests, aucun échec, erreur ou test ignoré. La migration V7 vers la dernière version conserve une exigence et ses références, avec version zéro. Après précision du test d’inactivité, les 51 tests HTTP passent sur les sources restaurées.
- Trois mutations détectées par assertion : retrait de l’autorisation de reclassement, de la vérification de version et du refus de classification inactive. La dernière assertion vérifie explicitement le motif et fournit une version courante, afin d’éviter un conflit de version masquant le contrôle d’activation. Voir [DEF-016](../../../revue/defauts/2026-11-09-DEF-016-test-inactivite-version.md). Sources restaurées avant construction du JAR final.
- Vitest : 17 tests réussis dans 8 fichiers, dont conservation des références/version, pagination des choix et transmission de version/CSRF.
- Playwright : **33 parcours réussis**, sans retry, sur le JAR final. Les deux nouveaux parcours passent : association et doublon, reclassement sans duplication, pagination, état vide, erreur réseau et reprise, conflit versionné avec rechargement. Le premier scénario attend la fermeture effective du dialogue avant de relire l’API, sans pause arbitraire.
- Clavier/focus : ouverture par Enter, titre initial, Tab vers la recherche, Escape et restitution au déclencheur, focus de l’erreur et retour au titre des profils après succès. Axe ne relève aucune violation sur le formulaire testé au bureau et à 375 pixels ; aucun débordement du document. La capture du formulaire à 375 pixels a été inspectée visuellement. Les labels des listes sont reliés explicitement aux contrôles, pour stabiliser leur nom indépendamment du texte des options.
- Python : 13 tests réussis ; contrôle du manifeste et liens locaux des 14 documents modifiés réussis, ainsi que `git diff --check`.
- Contrats OpenAPI régénérés, TypeScript strict et build Vite réussis ; JAR assemblé après restauration des sources.

L’ouverture initiale du dialogue a révélé [DEF-015](../../../revue/defauts/2026-11-09-DEF-015-import-editeur.md), récurrence de DEF-010 : import utilisé seulement comme type et supprimé au build. Import à effet de bord explicite et option TypeScript `verbatimModuleSyntax` ajoutés ; les autres imports de composants ont été examinés.

## Limites et suivi

La [recette métier conjointe de US-02.03 et US-02.04 est acceptée le 2026-11-09](acceptance-2026-11-09.md#us-0203-et-us-0204). L’utilisateur a ensuite confirmé que l’accessibilité est bonne ; les contrôles humains restants sont acceptés, sans détail des méthodes utilisées. Axe et le viewport étroit ne démontrent pas à eux seuls WCAG AA. Données fictives locales uniquement ; aucune classification officielle ni compétence acquise individuellement.

Le JAR de la livraison initiale de US-02.03 a pour SHA-256 `5f46554f3a6de4e8dfda38b20982917caf6389934b3475fe22ab2e7933182874`. Le [rapport de US-02.04](us-02-04-validation.md) identifie le JAR de la livraison commune disponible pour recette. Chromium partagé est arrêté après les tests.

La livraison validée est `d7cadc40596fa254af9d058a3b329abfe1022ba8`. Le code applicatif est identique à celui des validations consignées. L’utilisateur a ensuite validé la recette métier conjointe de US-02.03 et US-02.04 le 2026-11-09 ; sa confirmation est consignée dans la preuve d’acceptation liée ci-dessus.

La revalidation technique commune se rapporte à `d0f37dc5fc5779740eb775352ac6b56001499329` : 17 tests Vitest, build TypeScript/Vite et assemblage du JAR réussis ; 8 parcours navigateur des profils et exigences réussis, dont les parcours d’association, de doublon, de reclassement et de conflit de US-02.03. Les 2 nouveaux parcours de consultation sont rejoués avec succès sur le JAR final après le dernier ajustement du libellé affiché. Backend et contrats API sont identiques à `d7cadc4` ; leurs tests serveur ne sont pas présentés comme rejoués. Le manifeste utilise cette révision de livraison commune avec acceptation métier conjointe désormais enregistrée et accessibilité acceptée par confirmation utilisateur complémentaire.
