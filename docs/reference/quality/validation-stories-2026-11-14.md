---
title: "Validation des stories sessions, participations et pilotage"
created: 2026-11-14
updated: 2026-11-14
status: accepted
type: reference
---

# Validation des stories sessions, participations et pilotage

Périmètre : US-05.04, US-05.05, US-06.01 à US-06.04, US-07.01 et US-07.02. Les règles et critères viennent du [backlog MVP](../../functional-baseline-v1.0/reference/backlog-mvp.md). Les validations utilisent uniquement des données fictives locales.

## Sommaire

- [Périmètre fonctionnel](#périmètre-fonctionnel)
- [Conventions locales et compatibilité](#conventions-locales-et-compatibilité)
- [Stratégie de validation](#stratégie-de-validation)
- [Résultats techniques](#résultats-techniques)
- [Défauts corrigés](#défauts-corrigés)
- [Limites et recette](#limites-et-recette)

## Périmètre fonctionnel

| Story | Implémentation |
|---|---|
| [US-05.04](us-05-04-validation.md) | Coanimation de toute la session, recherche paginée des actifs, retrait et remplacement global, contrôle de version, avertissement de conflits confirmable, audit des changements en Planifiée. |
| [US-05.05](us-05-05-validation.md) | Clôture versionnée après le dernier créneau et sans participation Inscrite, avec zéro participant possible ; annulation de Brouillon ou Planifiée conservant toutes les associations et états ; audit atomique et exclusion des réalisations dans le pilotage. |
| [US-06.01](us-06-01-validation.md) | Création, recherche paginée, modification versionnée, désactivation et historique des participations, sans profil d’emploi ni compétence individuelle. |
| [US-06.02](us-06-02-validation.md) | Inscription en Planifiée, collaborateur actif, capacité stricte, doublon refusé ; réinscription sur la même participation, conflits confirmables. |
| [US-06.03](us-06-03-validation.md) | Présence ou absence globale après le dernier créneau ; intervenant limité à ses sessions ; correction après clôture réservée à l’administrateur fonctionnel selon SEC-01, avec avant/après, auteur et date. Les mécanismes existants de US-08.01/US-08.02 sont réutilisés. |
| [US-06.04](us-06-04-validation.md) | Désistement, place libérée, réinscription conservant l’identité, audit des deux transitions, désistements séparés des absences dans le pilotage. |
| [US-07.01](us-07-01-validation.md) | Stock courant de formations actives, sessions par état, participations hors annulations et participations annulées séparées ; zéro sans résultat. |
| [US-07.02](us-07-02-validation.md) | Activité paginée filtrée par période, formation et état, détail des créneaux, intervenants et effectifs courants, annulation explicitement affichée. |

## Conventions locales et compatibilité

Les champs collaborateur reprennent les limites des colonnes existantes : identifiant professionnel, prénom et nom requis, au plus 100 caractères après retrait des espaces externes. L’unicité de l’identifiant reprend la comparaison exacte de la contrainte PostgreSQL historique ; l’identifiant reste réservé après désactivation. Aucune normalisation de casse ou identité RH supplémentaire n’est inventée. V14 ajoute uniquement une version, sans modifier les identités ni les participations.

Le remplacement global d’intervenants conserve les affectations inactives déjà présentes, afin qu’un autre coanimateur puisse être ajouté ou retiré. Une nouvelle affectation vers un inactif reste refusée. Les anciens clients peuvent omettre la version en Planifiée ; les nouveaux formulaires transmettent toujours la version, obligatoire en Brouillon. Une requête sans changement ne produit ni audit ni incrément. Les doublons dans la sélection sont refusés.

Les opérations de planning, affectation, inscription et transition partagent le verrou de planning avant celui de la session. L’inscription verrouille aussi le collaborateur ; la réinscription relit son activation sous verrou. La clôture verrouille la même session que les présences : une présence ou une inscription concurrente ne peut invalider silencieusement son contrôle. Audit et résultat métier sont transactionnels.

La période est un intervalle d’instants `[from, until)`, avec décalage explicite dans l’API ; les formulaires indiquent UTC. Le rattachement est calculé côté serveur par `min(starts_at)`, avant les agrégations, sans multiplier les lignes par les créneaux ou intervenants. Une session sans créneau est incluse sans filtre temporel et exclue si une borne est renseignée. Les formations actives sont le stock courant global. Les réalisations désignent les sessions Terminées ; les participations hors annulations et celles des annulations sont affichées séparément. Aucun ratio ni taux de maîtrise n’est calculé. Les choix organisationnels de fuseau métier et de conservation des données restent ouverts.

Les [contrats sessions](../../../api/sessions.openapi.yaml), [collaborateurs](../../../api/collaborators.openapi.yaml), [participations et pilotage](../../../api/activity.openapi.yaml) et [audit](../../../api/audit.openapi.yaml) décrivent les opérations et erreurs. Les composants Lit utilisent des modèles de présentation et des adaptateurs, sans import de types OpenAPI générés.

## Stratégie de validation

Les comportements métier récupérables sont de criticité moyenne ; habilitations, capacité concurrente et conservation de l’historique ont des contrôles renforcés. Tests d’acceptation HTTP sur PostgreSQL Testcontainers pour les invariants, transactions et contrats ; exemples purs pour la limite temporelle exacte et l’admission ; tests Vitest pour les mappings et les requêtes CSRF ; Chromium pour les interactions natives, clavier, focus, erreurs et axe. Pas de bibliothèque de mutation supplémentaire, pas de doublure des modules applicatifs.

Les premières assertions de coanimation en Brouillon, d’administration collaborateur et de clôture ont échoué avant leur implémentation (409 au lieu de 204, 404 au lieu de 201 et 404 au lieu du refus de clôture attendu). L’inscription et les cas additionnels ont été écrits avec le code ; les contrôles de mutation complètent leur preuve. Les cas explicitement énumérés ont été groupés ; les vérifications concurrentes utilisent une barrière sans attente temporelle.

Les fixtures SQL existantes restent utilisées pour établir les préconditions de capacité et les états hérités ; les assertions des nouvelles stories passent par les interfaces HTTP publiques. Aucune lecture des tables n’est utilisée comme substitut à une réponse API manquante dans les nouveaux scénarios.

## Résultats techniques

Commit applicatif validé : `8aa353c5fdf8471a646475082526e9cbbb972903`. Les rapports et le manifeste renouvellent également les preuves techniques des stories antérieures sur ces suites rejouées, sans créer de nouvelle acceptation humaine.

| Contrôle | Résultat du 14 novembre 2026 |
|---|---|
| `mise run check` | Java 27.0.1.0.2, Node 26.13.0, Chromium 156.0.8078.80 et connexion PostgreSQL : OK. |
| Génération OpenAPI, typecheck et build Vite | Réussis, aucun nouveau paquet. |
| `mise exec -- npm --prefix frontend test` | 43 tests Vitest, 14 fichiers, tous réussis. |
| `mise exec -- bash -c 'cd backend && ./mvnw -q clean verify'` | 105 tests, zéro échec, erreur ou exclusion ; JAR construit. |
| Chromium/Playwright | 59 scénarios distincts réussis, sans retry : détail de l’interruption ci-dessous. |
| `mise exec -- python3 -m unittest discover -s scripts/tests` | 13 tests réussis. |
| `mise exec -- python3 scripts/progress.py check` | Réussi ; les hooks vérifient aussi le manifeste préparé. |
| `git diff --check` et liens locaux des documents concernés | Aucune anomalie constatée. |

La commande globale `mise exec -- npm --prefix frontend run test:e2e` a été interrompue par SIGTERM (code 143) après 54 scénarios réussis, sans échec d’assertion signalé. L’origine du signal n’est pas établie. Le lot `sessions.spec.ts subdomains.spec.ts` a ensuite terminé avec 9 scénarios réussis, dont les cinq restant à exécuter. L’union des deux journaux couvre les 59 scénarios distincts de la suite ; il ne s’agit pas d’une exécution globale unique achevée. Les journaux locaux sont `/tmp/pole-e2e-final.log` et `/tmp/pole-e2e-completion.log`.

Les nouveaux parcours couvrent sélection de coanimateurs avec Espace, conservation des choix, avertissement/abandon/confirmation des conflits, recherche des collaborateurs, version périmée et rechargement, désactivation et historique, inscription, désistement, réinscription, présence, clôture, annulation et pilotage filtré. Les scénarios historiques de permissions et correction après clôture sont également rejoués. Axe n’a remonté aucune violation dans les états analysés. Tab, Espace, Entrée, Escape et déplacements/restitutions de focus sont contrôlés aux interactions concernées. Largeur 375 px sans débordement horizontal ; capture mobile du pilotage inspectée. Les captures locales dans `frontend/test-results/` sont temporaires et peuvent être remplacées au prochain lancement.

Quatre mutations temporaires ont été détectées, puis les sources restaurées : suppression du contrôle des présences avant clôture, dépassement de la capacité exacte, remplacement du premier créneau par le dernier pour la période, suppression du contrôle d’habilitation collaborateur. Les scripts temporaires traitent SIGTERM/SIGINT et restaurent les fichiers dans `finally`. Une interruption n’est pas comptée comme détection.

## Défauts corrigés

- [DEF-028](../../../revue/defauts/2026-11-14-DEF-028-selection-coanimation.md) : identité DOM instable pendant la sélection clavier ; cases conservées et clés UUID, assertion après Espace et contrôle de la persistance.
- [DEF-029](../../../revue/defauts/2026-11-14-DEF-029-isolation-sessions-tests.md) : sessions de test conservées entre scénarios ; nettoyage des créations après chaque test, puis suite complète.

## Limites et recette

Les validations automatisées ne constituent pas une recette humaine ni une certification WCAG AA. Restent la recette métier des huit stories, un lecteur d’écran représentatif et le zoom navigateur réel à 200 %. La vue mobile et les contrôles axe/clavier exécutés sont détaillés dans les résultats techniques. Aucune acceptation humaine n’est inventée dans le manifeste.

SSO, provisionnement des comptes de production, politique de conservation et usage de données réelles restent hors livraison. Aucun système de liste d’attente, présence par créneau, attribution de parcours ou compétence acquise n’est ajouté.
