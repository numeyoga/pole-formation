---
title: "Comment lancer et vérifier la première fonctionnalité"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: how-to
---

# Comment lancer et vérifier la première fonctionnalité

## Sommaire

- [Préparer](#préparer)
- [Construire et lancer](#construire-et-lancer)
- [Se connecter](#se-connecter)
- [Exécuter les validations](#exécuter-les-validations)

## Préparer

Ouvrir le dépôt dans le [devcontainer](dev-container.md). Avec Podman rootless, utiliser la configuration `podman/devcontainer.json` et reconstruire le conteneur après une modification de ses montages. Le socket Podman doit être actif sur l’hôte ; il est nécessaire aux tests Testcontainers.

## Construire et lancer

Toutes les commandes suivantes s’exécutent dans le devcontainer, depuis la racine du dépôt :

```bash
npm --prefix frontend ci
npm --prefix frontend run generate:api
npm --prefix frontend run build
cd backend
./mvnw package
java -jar target/pole-formation-0.1.0-SNAPSHOT.jar --spring.profiles.active=dev
```

Ouvrir le port transféré **8080**. L’interface et l’API sont servies par Spring Boot sous la même origine. Arrêter l’application avec Ctrl+C.

Pour travailler sur le frontend avec rechargement automatique, lancer `npm --prefix frontend run dev` dans un autre terminal. Le port 5173 utilise un proxy `/api` vers le backend sur 8080.

## Se connecter

Le profil `dev` fournit des **comptes et données fictifs de démonstration**, sans données de collaborateurs réels. Le mot de passe d’exemple commun est `Dev-only-2026!`.

| Identifiant | Rôle initial | Périmètre |
|---|---|---|
| `admin` | Administrateur fonctionnel | Toutes les sessions et changement des rôles |
| `gestionnaire` | Gestionnaire | Toutes les sessions, gestion courante |
| `intervenant` | Intervenant | Accueil, session clôturée et session à venir |
| `intervenant-b` | Intervenant | Prévention |
| `sans-affectation` | Intervenant | Aucune session |

Le profil par défaut ne charge ni ces comptes ni les données fictives. Les modifications de rôle sont persistées : redémarrer l’application ne réinitialise pas les habilitations. Restaurer les rôles via `admin` après un essai. Le provisionnement de production reste à définir.

## Exécuter les validations

Depuis la racine du dépôt, avec l’application lancée sur 8080 pour Playwright :

```bash
npm --prefix frontend run typecheck
npm --prefix frontend test
npm --prefix frontend run test:e2e
cd backend
./mvnw test
python3 check-security-mutations.py
./mvnw test
```

Le contrôle de mutations restaure les sources même en cas d’échec. Il modifie temporairement les sources : ne pas lancer une autre compilation backend en parallèle. Le dernier `./mvnw test` recompile les sources restaurées.

Les tests serveur créent leurs propres PostgreSQL temporaires et ne réutilisent pas la base de développement. Les tests navigateur utilisent les comptes fictifs de la base dev et restaurent le rôle qu’ils changent ; ils enregistrent une présence sur la session d’exemple.

Après une interruption brutale des tests, vérifier les conteneurs temporaires restants avec Podman sur l’hôte. Ne pas supprimer le volume de développement pour nettoyer les tests. Voir le [rapport de validation](../reference/quality/us-08-01-validation.md).
