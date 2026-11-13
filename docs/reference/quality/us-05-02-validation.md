---
title: "Validation US-05.02 — Créneaux et conflits de planning"
created: 2026-11-13
updated: 2026-11-13
status: accepted
type: reference
---

# Validation US-05.02 — Créneaux et conflits de planning

## Sommaire

- [Périmètre](#périmètre)
- [Contrats et intégrité](#contrats-et-intégrité)
- [Interface et accessibilité](#interface-et-accessibilité)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

Les six critères de [US-05.02](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0502-gérer-les-créneaux-et-conflits) sont implémentés localement. Le volet de gestion des sessions permet d’ajouter et de modifier les créneaux en Brouillon et Planifiée. Les créneaux non consécutifs sont conservés et restitués chronologiquement par le serveur. Les intervalles invalides et les chevauchements internes sont bloquants ; les intervalles contigus sont autorisés.

Les conflits d’intervenants ou collaborateurs entre sessions planifiées nécessitent un avertissement que le gestionnaire peut confirmer. Les modifications et ajouts en Planifiée sont audités atomiquement. Les sessions Terminées ou Annulées sont en lecture seule pour les créneaux. Aucun écran de suppression de créneau n’est livré : ce comportement ne figure pas dans les critères et ses conditions, notamment sur le dernier créneau, restent à définir.

## Contrats et intégrité

Le [contrat des sessions](../../../api/sessions.openapi.yaml) étend `POST /api/sessions/{id}/creneaux` aux sessions planifiées avec `version` obligatoire et `confirmConflicts` facultatif. Le [contrat d’audit](../../../api/audit.openapi.yaml) étend le PUT de créneau au brouillon et accepte une version de session. Le brouillon exige la version ; l’ancien PUT sans version reste compatible uniquement en Planifiée. Tous les nouveaux formulaires transmettent la version affichée.

Une écriture obsolète est refusée avec 409 avant mutation, y compris lors d’une confirmation. Un changement effectif de créneau incrémente la version. Une modification sans effet ne produit ni incrément ni audit. Les contrôles `MANAGE_SESSION`, session HTTP et CSRF restent appliqués côté serveur.

Les ajouts, modifications, affectations et transitions sensibles partagent le verrou transactionnel consultatif défini par [ADR 0009](../../decisions/ADR-0009-transactional-audit.md), puis verrouillent la session. Le calcul des conflits PostgreSQL est mutualisé dans un adaptateur unique, sans duplication de requête. L’ajout et la planification utilisent maintenant ce même ordre de verrouillage. Aucune migration ni dépendance ajoutée.

Le calcul porte sur **tous les créneaux de la session** après modification : un conflit précédemment confirmé peut donc être signalé de nouveau lors d’un changement ultérieur. Le code ne réduit pas ce calcul au seul créneau proposé. La confirmation ne permet jamais de contourner un chevauchement interne, un intervalle invalide, un état terminal ou une version périmée.

En Planifiée, l’événement `AJOUT_CRENEAU` contient un avant vide et un après avec début/fin UTC ; `MODIFICATION_CRENEAU` conserve les anciennes et nouvelles valeurs. Un échec de l’audit annule la mutation et l’incrément de version. Les refus et les avertissements non confirmés ne créent aucun succès fictif. Le journal traduit le nouvel événement « Ajout de créneau ».

## Interface et accessibilité

Chaque créneau modifiable possède une action contextualisée. Le formulaire reprend les instants en UTC et affiche le décalage explicitement ; aucune conversion implicite selon le navigateur. L’adaptateur mappe les DTO vers les valeurs de saisie et de présentation, sans règle de conflit côté client.

Après un avertissement, le formulaire est figé et affiche les dates proposées ainsi que le nombre de sessions en conflit. Le gestionnaire choisit « Confirmer malgré les conflits » ou « Abandonner ce changement ». La confirmation transmet la proposition et la version capturées ; l’abandon réactive les champs et rend le focus au début. Une erreur ordinaire, dont une version périmée, ne propose pas de confirmation ; le rechargement retire la proposition obsolète.

Le focus rejoint le résumé d’erreur ou l’avertissement, puis le titre de session après succès. Les résultats sont annoncés par une région de statut persistante. Le journal est actualisé après les changements de sessions. Le guide `forms` de modern-web-guidance a été appliqué aux noms des formulaires, aux champs natifs, à la désactivation durant la requête et au focus sur le résumé (« or an error summary »).

## Stratégie et preuves

Gestion temporelle et état : criticité de travail moyenne, complexité élevée ; intégrité de l’audit et contrôle d’accès traités comme critiques. Tests par interfaces publiques : HTTP JUnit sur PostgreSQL Testcontainers réel, mappings et requêtes Vitest, parcours Chromium avec clavier et axe. Pas de mock des modules serveur propres, ni de test d’une méthode privée. Les doubles HTTP frontend portent uniquement sur les réponses de frontière.

Le premier scénario HTTP a échoué avant implémentation sur la modification du brouillon, puis a passé. Il couvre aussi l’ajout planifié, l’avertissement sans effet, la confirmation et l’audit, la version périmée, le tri chronologique et le refus des états terminaux. Les tests HTTP existants couvrent les intervalles contigus et invalides, les chevauchements et les conflits de collaborateurs. Des scénarios supplémentaires vérifient le rollback de l’ajout si l’audit échoue et deux ajouts concurrents à la même version : un succès 201 et un refus 409, un seul audit.

Validations sur l’hôte avec Mise le 2026-11-13 :

- Génération des types OpenAPI des contrats sessions et audit réussie.
- TypeScript et build Vite réussis ; Vitest : **33 tests réussis**.
- Maven `verify` réussi : **91 tests**, dont les **75 tests HTTP** et les tests métier et migrations PostgreSQL.
- Trois parcours de sessions réussis : création et planification ; erreurs et rechargement ; conflits réels d’intervenant entre deux sessions, abandon, confirmation, modification, refus du chevauchement, ajout contigu et événements du journal. Clavier, focus, axe et largeur 375 px couverts.
- Suite complète Playwright : **51 scénarios réussis**, zéro échec, sur la base fictive enrichie conservée. Capture de l’avertissement à 375 px inspectée : champs, texte et actions restent dans le dialogue défilable sans débordement horizontal.
- Scripts de suivi : **13 tests réussis** ; manifeste, liens locaux modifiés et `git diff --check` contrôlés.
- Trois mutations détectées par le scénario HTTP : suppression du contrôle de version, du refus des états terminaux et de la confirmation de conflits. Sources restaurées ; les trois nouveaux scénarios HTTP ont repassé.

Les préconditions de conflits de deux tests ont été corrigées pour atteindre effectivement les barrières d’audit et de concurrence : [DEF-026](../../../revue/defauts/2026-11-13-DEF-026-conflits-preexistants-tests.md). Aucune règle métier n’a été assouplie.

## Limites et recette

Le commit de livraison `9f93043f757a0716f2c95430d4ff80da528a9d72` contient le code validé ci-dessus. Le manifeste le référence comme implémentation complète ; la recette humaine reste ouverte. Recette métier humaine, lecteur d’écran et zoom réel à 200 % restent à réaliser. Les résultats axe et clavier automatisés ne constituent pas une certification WCAG AA.

Le fuseau métier d’entrée et de restitution demeure une question ouverte ; le décalage explicite et UTC sont conservés. La compatibilité du PUT historique sans version ne fournit pas une protection optimiste à ses anciens clients. Le détail nominatif des personnes en conflit n’est pas ajouté ; l’interface signale le nombre de sessions concernées et la proposition temporelle à confirmer.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

La [confirmation du représentant du projet](acceptance-2026-11-13.md) clôt la recette et les réserves d’accessibilité encore mentionnées dans ce rapport. Les protocoles humains individuels ne sont pas détaillés.
