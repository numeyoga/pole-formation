---
title: "Contrat API et sécurité HTTP"
description: "Frontière REST, DTO, erreurs et sécurité de session."
created: 2026-11-07
updated: 2026-11-08
status: accepted
type: reference
tags:
  - api
  - security
  - architecture
---

# Contrat API et sécurité HTTP

## Sommaire
- [Contrat](#contrat)
- [Erreurs](#erreurs)
- [Authentification et autorisation](#authentification-et-autorisation)
- [Déploiement](#déploiement)

## Contrat

- API JSON sous `/api`; OpenAPI versionné à la source ; génération du client TypeScript **hors des composants Lit**.
- DTO publics adaptés aux cas d'utilisation ; pas d'exposition directe des entités domaine/JPA.
- Identifiants opaques, dates ISO 8601 explicites, pagination filtrage et tri définis contractuellement.
- Le frontend transforme DTO → modèles de présentation ; le backend est autorité sur règles et données.
- Les endpoints d’accès et habilitations sont définis dans le [contrat OpenAPI](../../../api/openapi.yaml). Le [contrat du journal](../../../api/audit.openapi.yaml) couvre les changements sensibles et le [contrat des domaines](../../../api/domains.openapi.yaml) décrit US-01.01. Les endpoints des autres stories restent à concevoir.

## Erreurs

- Privilégier `application/problem+json` (RFC 9457) ; distinguer erreur de format, violation métier, introuvable, conflit, non authentifié, interdit.
- Définir un format stable pour les erreurs de champ avant développement des formulaires complexes.
- Éviter de retourner stacktraces et détails internes aux clients.

## Authentification et autorisation

- Spring Security + **session HTTP serveur**, cookie `HttpOnly`, `Secure` en HTTPS, `SameSite` adapté ; protection CSRF pour les requêtes mutantes.
- Authentification via fournisseur d'identité entreprise **à confirmer** ; ne pas bâtir de stockage de mot de passe local par défaut.
- Contrôles côté backend pour chaque opération ; masquage UI ne constitue jamais une autorisation.
- Rôles distingués : intervenant, gestionnaire, administrateur fonctionnel. La [répartition détaillée des permissions](roles-permissions.md) est validée pour le MVP ; l’identité de production reste ouverte.

## Déploiement

- Une origine publique : statiques Vite servis par Spring Boot et API sous `/api` ; fallback SPA pour routes client **à l'exclusion** de `/api`, assets et erreurs techniques.
- Développement local possible avec proxy Vite → backend ; ne pas assouplir CORS/CSRF sans contrainte vérifiée.
