---
title: "ADR 0018 — Première livraison autonome sous Podman"
created: 2026-11-16
updated: 2026-11-16
status: accepted
type: decision
---

# ADR 0018 — Première livraison autonome sous Podman

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

Le représentant du projet demande le 16 novembre une première livraison sur une
machine disposant de Podman. Le frontend est déjà intégré au JAR Maven. L’identité
d’entreprise reste ouverte ; le profil par défaut ne fournit aucun utilisateur.

## Décision

Produire un paquet contenant les images applicative Java 27 et PostgreSQL 18,
un lanceur Bash sans Compose, les métadonnées de construction et des sommes de
contrôle. La cible est Linux rootless, sur la même architecture CPU que le poste
de construction. Le développement continue sur l’hôte avec Mise (ADR 0013).

Le lanceur sépare application et base, conserve PostgreSQL dans un volume nommé,
ne publie pas son port et utilise un rôle applicatif non superutilisateur.
Les mots de passe sont générés sur la cible et montés avec les secrets Podman.
Le profil explicite `standalone`, exclusif de `dev` pour le bootstrap, crée un
administrateur local sans modifier un compte existant. Il ne charge pas les
fixtures de développement et ne remplace pas la décision d’identité de production.

L’accès initial est limité à la boucle locale en HTTP, avec tunnel SSH pour
l’accès distant. Une exposition aux utilisateurs passe par un reverse proxy
HTTPS avec cookie Secure. L’unité systemd utilisateur est optionnelle pour le
démarrage de la pile au redémarrage de la machine.

## Conséquences

La première installation permet une recette autonome avec un administrateur.
Le provisionnement d’autres comptes, le SSO et les règles de conservation restent
ouverts. Aucun nouveau modèle métier, rôle ni contrat API n’est ajouté.

Les mises à jour remplacent uniquement l’application après sauvegarde. Les
migrations Flyway peuvent limiter le retour au code précédent ; une restauration
est alors nécessaire. Les mises à niveau PostgreSQL sont une opération distincte.
La procédure et les limites sont décrites dans le [guide Podman](../how-to/build-deploy-container.md).
