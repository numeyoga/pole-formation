---
title: "Livraison et validation de US-08.01"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Livraison et validation de US-08.01

## Sommaire

- [Périmètre livré](#périmètre-livré)
- [Traçabilité des critères](#traçabilité-des-critères)
- [Stratégie de tests](#stratégie-de-tests)
- [Résultats](#résultats)
- [Limites](#limites)

## Périmètre livré

US-08.01 fournit l’authentification locale de développement par Spring Security, une session HTTP, CSRF, déconnexion, trois rôles fixes, filtrage serveur des sessions affectées et projection minimale des participants. Le changement de rôle est réservé à l’administrateur fonctionnel, audité atomiquement et effectif à la prochaine opération d’une session existante.

La [matrice](../architecture/roles-permissions.md) a été validée par le représentant du projet le 2026-11-08. Les fixtures fictives couvrent gestionnaire, administrateur, deux intervenants distincts, compte sans affectation, sessions passée, future et clôturée. Le contrat [OpenAPI](../../../api/openapi.yaml) et ses types TypeScript sont versionnés.

Les règles de contrôle de présence et deux endpoints de modification de libellé permettent d’observer les autorisations sur des opérations persistées. Ils ne constituent pas la livraison des stories complètes de gestion de référentiels, sessions ou participations. L’audit des rôles et corrections fournit une fondation de US-08.02, qui reste à compléter.

## Traçabilité des critères

| Critère US-08.01 | Preuve serveur |
|---|---|
| 1 — Refus sans authentification | `anonymous_access_and_missing_csrf_are_rejected` |
| 2 — Gestionnaire habilité autorisé | `manager_can_modify_referential_but_not_admin_permissions` |
| 3 — Sessions affectées uniquement | `instructor_only_sees_assigned_sessions_and_safe_participant_fields` |
| 4 — Participants : projection minimale | Même test, liste exacte des propriétés du JSON |
| 5 — Refus sur sessions non affectées | `guessing_another_session_or_participation_cannot_bypass_assignment` : lecture, écriture et identifiant de participation d’une autre session |
| 6 — Référentiel interdit à l’intervenant | `instructor_only_sees_assigned_sessions_and_safe_participant_fields` |
| 7 — Permissions réservées à l’administrateur | Tests gestionnaire et correction après clôture ; politique unitaire des trois rôles |
| 8 — Changement de rôle, révocation et audit | `role_changes_take_effect_for_an_existing_session_and_are_audited` |

Le JSON participants contient nom, prénom, identifiant professionnel, état et un identifiant technique de participation nécessaire aux actions ; il n’expose ni compte ni identifiant technique du collaborateur. Les futures données personnelles supplémentaires ne doivent pas enrichir implicitement cette projection.

## Stratégie de tests

Surface sécurité : criticité élevée et complexité limitée, tests à la frontière HTTP avec vrai serveur, vrais cookies, CSRF et PostgreSQL Testcontainers. Le premier test a échoué avec 401 au lieu de 200 sur le jeton CSRF avant implémentation. Les cas énumérés par les critères sont ensuite regroupés par comportement.

La politique pure dispose d’un contrat distinct : matrice exhaustive des permissions et conditions temporelles sans dépendance Spring/JPA. Les autres contrôles HTTP vérifient la session, les erreurs de format et la déconnexion. Le profil par défaut est testé sur une seconde base temporaire pour prouver l’absence de comptes/données de démonstration et la configuration Secure/HttpOnly/SameSite des cookies.

Exception à l’observation par API : les assertions d’audit et le test de panne utilisent la base directement, car aucun endpoint de consultation d’audit n’est livré dans cette tranche. Un trigger de test provoque l’échec de l’écriture d’audit ; le test vérifie le rollback du changement de rôle via l’API et l’absence de faux succès. Les fixtures et ce trigger sont limités à la base Testcontainers.

Trois mutations ciblées ont été détectées par des assertions : suppression du contrôle d’affectation, élévation des permissions du gestionnaire, désactivation de CSRF. Les sources sont restaurées automatiquement. Aucun framework de mutation supplémentaire n’a été ajouté.

Le frontend teste le mapping DTO → présentation avec Vitest. Les parcours Playwright utilisent l’application réelle et contrôlent aussi clavier, focus, dialogue natif, erreurs, état vide, rechargement, session et axe. Aucun mock d’un module du projet n’est utilisé.

## Résultats

- Maven `clean verify` : 12 tests réussis, aucun échec ni test ignoré ; PostgreSQL Testcontainers.
- Génération OpenAPI, TypeScript strict et build Vite : réussis.
- Vitest : 1 test de mapping réussi.
- Mutations de sécurité : 3 détectées ; sources restaurées et tests serveur rejoués avec succès.

- Playwright Chromium : 4 parcours réussis, zéro retry. Axe : aucune violation sur connexion, erreur d’authentification, participants et dialogue ouvert.
- Clavier/focus : Tab, Enter, Escape, focus sur erreur, après connexion et déconnexion, entrée et sortie du dialogue vérifiés.
- Inspection visuelle des captures administrateur à 2048 et 375 pixels : contrôles lisibles, retours à la ligne corrects ; absence de débordement vérifiée à 2048, 1024 et 375 pixels. Un vrai zoom navigateur 200 % et un essai humain avec lecteur d’écran restent à effectuer.

Les huit critères disposent ainsi d’une implémentation et d’une preuve automatisée dans le périmètre local. La recette métier humaine et les contrôles d’accessibilité manuels restants ne sont pas déclarés exécutés.

## Limites

Le fournisseur d’identité, le provisionnement et les politiques de conservation de production restent ouverts. Les comptes locaux ne sont disponibles qu’en profil `dev`. Le cumul de rôles et un éditeur de permissions ne font pas partie de cette tranche ; l’administrateur inclut les droits du gestionnaire.

Les invariants des stories à venir (capacité, concurrence d’inscription, gestion complète des classifications et référentiels) ne sont pas réputés testés ici. Les sessions et données minimales ajoutées pour le contrôle d’accès devront évoluer avec ces stories.

L’analyse axe et les scénarios clavier ne démontrent pas à eux seuls WCAG 2.2 AA. Aucun essai avec lecteur d’écran humain n’a été réalisé dans cette session. Docker et le déploiement de production ne sont pas validés par cette recette.

Commandes et comptes fictifs : [guide de lancement](../../how-to/run-local-app.md). Décisions techniques : [ADR 0007](../../decisions/ADR-0007-bootstrap-habilitations.md).
