---
title: "Développement et validation de US-02.02"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Développement et validation de US-02.02

## Sommaire

- [Périmètre](#périmètre)
- [Critères et décisions](#critères-et-décisions)
- [Stratégie et résultats](#stratégie-et-résultats)
- [Limites et suivi](#limites-et-suivi)

## Périmètre

API `/api/referentiels/classifications` et panneau Lit réservé à l’administrateur fonctionnel : création active, consultation paginée, modification du code, libellé, ordre et activation, désactivation et réactivation. Le gestionnaire consulte les classifications par API pour les exigences ; l’intervenant n’y accède pas. Les exigences historiques restent conservées.

## Critères et décisions

| Critère | Couverture |
|---|---|
| Création d’une valeur utilisable | POST classification active puis POST exigence par API |
| Libellé/ordre modifiés sans perte des références | Même identifiant d’exigence et de classification après modification |
| Valeur inactive exclue des nouveaux choix | Liste `activeOnly=true` et refus serveur des associations à une valeur inactive |
| Historique visible après désactivation | GET exigences avec référence conservée et libellé courant |

REF-05 a été confirmée explicitement pendant la réalisation. Voir [ADR 0015](../../decisions/ADR-0015-classifications.md). L’édition et le reclassement des exigences appartiennent à US-02.03, sans interface anticipée ici.

## Stratégie et résultats

Administration récupérable : criticité moyenne et faible complexité selon les conventions du projet. Droits, concurrence et conservation : couverture prudente des risques élevés à la frontière HTTP/PostgreSQL réel. Premier scénario HTTP exécuté en échec (GET attendu 200, reçu 404), puis passé après implémentation ; scénarios énumérés par la baseline ajoutés en lot avec le code. Vitest couvre le mapping et les erreurs de l’adaptateur ; Playwright couvre parcours, clavier/focus, réseau, pagination et axe. Aucun mock de module métier interne ni test de méthode privée. Le double fetch reste limité à la frontière HTTP déclarée par OpenAPI. Pas de référence de stack Java/Lit dans le skill testing ; conventions JUnit/Testcontainers/Vitest/Playwright du projet appliquées.

Validations exécutées sur l’hôte avec Mise, Java 27, PostgreSQL 18 sous Testcontainers/Podman et Chromium distant :

- Génération des contrats OpenAPI, TypeScript strict et build Vite réussis ; JAR assemblé avec Maven.
- Maven `verify` : **63 tests réussis**, aucun échec, erreur ou test ignoré. La migration V7 → V8 est testée sur une classification inactive déjà utilisée, avec conservation des identifiants, du libellé, de l’état et de l’exigence. Après les derniers ajustements de format et le retrait de l’ancien chemin interne de renommage, les **48 tests HTTP** ont été rejoués avec succès et le JAR réassemblé.
- Le test HTTP de fraction d’ordre a été observé en échec (201 au lieu de 400), puis réussi après conversion exacte. Fractions de version et dépassement de capacité numérique sont aussi refusés. Voir [DEF-013](../../../revue/defauts/2026-11-08-DEF-013-entiers-json.md).
- **3 mutations serveur détectées par assertion** : suppression du contrôle de configuration réservé à l’administrateur, du contrôle de version et du refus d’une classification inactive. Les sources sont restaurées systématiquement ; le test d’activation utilise un autre profil pour éviter de confondre inactivité et doublon d’exigence. Commande : `mise exec -- python3 backend/check-security-mutations.py --classifications`.
- Vitest : **14 tests réussis**, 8 fichiers. Le nouvel adaptateur conserve identité, ordre, version, statut et pagination ; il présente les erreurs de champ et de session. L’inversion du statut affiché a été détectée par assertion, puis la suite a été rejouée après restauration.
- Playwright : **31 parcours réussis**, sans retry, dont **5 nouveaux parcours** pour création, modification, activation, doublon, concurrence/rechargement, réseau, pagination et droits. Les parcours existants sont également passés. Les cinq parcours de classifications ont été rejoués sur le JAR final après redémarrage : tous réussis en 11,1 secondes. Une assertion de défilement a été rendue déterministe en attendant son effet observable, voir [DEF-014](../../../revue/defauts/2026-11-08-DEF-014-attente-defilement.md).
- Clavier : activation de la navigation par Enter, focus du titre et du premier champ, Tab dans le formulaire, Escape avec restitution au bouton déclencheur, focus après succès ou conflit, et défilement du tableau aux flèches à 375 pixels. Aucun débordement du document sur ce viewport.
- Axe : aucune violation sur les états testés, notamment formulaire, doublon et affichage à 375 pixels. La capture locale du dialogue sur petit écran a été inspectée visuellement.
- Python : **13 tests réussis**, dont la sélection des trois mutations de classifications et les périmètres existants. Liens locaux des documents modifiés et `git diff --check` réussis.

Les tests d’exigences vérifient le raccordement minimal existant ; l’éditeur et le reclassement restent hors du périmètre de cette livraison. Les interfaces natives existantes et les outils du projet suffisent, sans dépendance ou outil supplémentaire ajouté. Aucun test de détail interne n’a été ajouté.

## Limites et suivi

La recette métier humaine, le lecteur d’écran et le zoom navigateur réel à 200 % restent à effectuer. Axe et la réduction du viewport ne démontrent pas à eux seuls WCAG AA. Les données des parcours sont fictives et locales. Aucune valeur officielle ni sens métier de classification n’est fixé.

La livraison applicative validée est `de6aa484452518b17042ce90e7a365c7bb25052f`. Aucun code applicatif n’a changé entre les validations finales et ce commit. Le manifeste rattache la preuve à cette révision ; aucune acceptation humaine n’est déclarée.
