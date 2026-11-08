# DEF-001 — Premier démarrage du devcontainer sous Podman rootless

Date : 2026-11-08. Gravité : 🟠, environnement local bloqué, aucune donnée métier présente. Statut : corrigé, non commité.

## Faits et reproduction

L’ouverture initiale par Dev Containers CLI 0.88.0 et Podman rootless échoue après construction : Compose nomme l’image `docker.io/library/pole-formation_devcontainer-workspace`, puis le CLI tente un build d’ajustement UID depuis `localhost/pole-formation_devcontainer-workspace`. La reproduction du build échoue en cherchant un registre sur localhost.

Après correction du nom d’image, PostgreSQL s’arrête : son journal signale un montage inutilisé sur `/var/lib/postgresql/data` et demande `/var/lib/postgresql` pour la version 18.

Après correction du montage, l’ouverture réussit mais le smoke test sous `pwuser` échoue sur `test -w .`. `id` indique UID/GID 1001, tandis que le dépôt est présenté comme appartenant à UID 1000. L’ajustement automatique du CLI ne résout pas ce conflit dans cette image ; le mapping rootless ne garantit donc pas l’écriture au propriétaire attendu.

## Causes et corrections

- `.devcontainer/compose.yaml` : nom court implicite d’image divergent entre Compose et CLI. Nom explicite `localhost/pole-formation-devcontainer:local`.
- Même fichier : ancien chemin de volume incompatible avec PostgreSQL 18. Montage du volume nommé sur `/var/lib/postgresql`, sans suppression de volume.
- `.devcontainer/devcontainer.json` : configuration générique insuffisante pour les droits sous Podman rootless. Variante `.devcontainer/podman/devcontainer.json`, ajustement automatique UID désactivé et surcharge `.devcontainer/compose.podman.yaml` avec `keep-id:uid=1001,gid=1001`.

## Barrière manquante

La configuration avait été écrite sans construction et ouverture réelles, ni test d’écriture sous l’utilisateur distant. La validation syntaxique Compose seule ne détecte aucun de ces trois échecs.

## Recherche de variantes

Recherche ciblée dans `.devcontainer/`, le guide et ADR-0006 : un seul ancien montage, corrigé ; une configuration distante générique, conservée pour Docker et explicitement distinguée de la variante Podman. Aucun autre service workspace ni montage de données obsolète trouvé dans ce périmètre. La variante Docker reste à exécuter.

## Validation et prévention

Ouverture Podman : `outcome: success`. Le script `.devcontainer/check-environment.sh` passe sous `pwuser` : écriture autorisée, Java/javac 27, Node, Playwright 1.64.1, Chromium headless et connexion TCP à db. Une requête SQL authentifiée via TCP depuis db confirme PostgreSQL 18.6, la base et le rôle attendus.

Le script et le guide rendent la vérification reproductible. La checklist impose une ouverture complète après modification des images, montages, utilisateurs ou fonctionnalités. Les tests applicatifs et Testcontainers ne sont pas encore disponibles.
