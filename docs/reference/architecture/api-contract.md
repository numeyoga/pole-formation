---
title: "Contrat API et sécurité HTTP"
description: "Frontière REST, DTO, erreurs et sécurité de session."
created: 2026-11-07
updated: 2026-11-07
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
- Les noms/endpoints précis restent **à concevoir**, ne pas déduire `/api/formations` comme contrat déjà publié.

## Erreurs

- Privilégier `application/problem+json` (RFC 9457) ; distinguer erreur de format, violation métier, introuvable, conflit, non authentifié, interdit.
- Définir un format stable pour les erreurs de champ avant développement des formulaires complexes.
- Éviter de retourner stacktraces et détails internes aux clients.

## Authentification et autorisation

- Spring Security + **session HTTP serveur**, cookie `HttpOnly`, `Secure` en HTTPS, `SameSite` adapté ; protection CSRF pour les requêtes mutantes.
- Authentification via fournisseur d'identité entreprise **à confirmer** ; ne pas bâtir de stockage de mot de passe local par défaut.
- Contrôles côté backend pour chaque opération ; masquage UI ne constitue jamais une autorisation.
- Politique de rôles/habilitations détaillée encore à arbitrer ; voir [open questions](open-questions.md).

## Déploiement

- Une origine publique : statiques Vite servis par Spring Boot et API sous `/api` ; fallback SPA pour routes client **à l'exclusion** de `/api`, assets et erreurs techniques.
- Développement local possible avec proxy Vite → backend ; ne pas assouplir CORS/CSRF sans contrainte vérifiée.
