---
title: "ADR 0007 — Bootstrap et habilitations"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0007 — Bootstrap et habilitations

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)

## Contexte

US-08.01 nécessite un socle exécutable, des comptes locaux de développement et des contrôles observables sur des sessions et participations. Le représentant du projet a validé la matrice intervenant / gestionnaire / administrateur fonctionnel le 2026-11-08.

## Décision

- Maven Wrapper 3.9.16, Spring Boot 4.1.2, Java 27. La [matrice officielle Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html) consultée le 2026-11-08 annonce cette compatibilité.
- npm avec lockfile ; versions exactes Lit 3.3.3, Vite 8.3.6, TypeScript 5.9.3, Vitest 5.1.0, Playwright 1.64.1, axe Playwright 4.14.0, openapi-typescript 7.13.0 et openapi-fetch 0.17.0. TypeScript 5 satisfait la dépendance du générateur OpenAPI.
- Module backend `habilitations`, domaine et application sans Spring/JPA ; adaptateurs HTTP et PostgreSQL externes. Comptes lus via Spring Data JPA, projections et écritures transactionnelles via JdbcClient sur le même DataSource.
- Un rôle courant par compte ; l’administrateur fonctionnel inclut les permissions du gestionnaire. Les droits sont relus pour chaque opération, y compris pour les sessions HTTP déjà ouvertes.
- Spring Security gère connexion, fixation de session, session HTTP, déconnexion et CSRF. Les politiques applicatives contrôlent chaque opération et son périmètre. Aucun stockage navigateur de jetons.
- Les cinq comptes et les données fictives sont chargés uniquement avec le profil `dev`. Aucun compte ni donnée de démonstration n’est provisionné par le profil par défaut.
- Le contrat [OpenAPI](../../api/openapi.yaml) génère les types du client utilisé par l’adaptateur frontend. Les composants Lit ne dépendent que des modèles de présentation.
- L’interface Vite compilée est intégrée au JAR Spring Boot sous la même origine. Aucun routeur ni Slab n’est nécessaire pour cet écran.

## Alternatives

Gradle et un autre gestionnaire JS n’apportent pas de besoin supplémentaire démontré. Un éditeur de permissions et le cumul de rôles complexifieraient cette première tranche. Le fournisseur SSO reste un choix organisationnel ouvert ; les comptes locaux ne le remplacent pas en production.

## Conséquences

La [matrice validée](../reference/architecture/roles-permissions.md) s’applique aux endpoints implémentés. Les permissions des autres fonctionnalités sont définies mais ne signifient pas que ces fonctionnalités sont livrées. Le schéma des sessions et référentiels est limité aux besoins d’accès et évoluera par migrations avec leurs stories.

Les données fictives de développement utilisent une migration V900 séparée ; `out-of-order` est activé uniquement en dev pour permettre les futures migrations métier de version inférieure. Les tests partent d’un PostgreSQL Testcontainers neuf.

La variante Podman monte le socket du moteur dans le workspace pour Testcontainers. Ryuk est désactivé en rootless ; les conteneurs de test sont arrêtés par JUnit en fonctionnement normal. Après interruption brutale, leur nettoyage reste à vérifier sur l’hôte. Docker et le déploiement de production restent hors de cette validation.
