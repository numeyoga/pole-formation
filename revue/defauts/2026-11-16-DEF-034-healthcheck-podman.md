# DEF-034 — Contrôle de santé supprimé par le format d’image

Observé le 2026-11-16 pendant le test de la première livraison Podman.
Gravité : 🟠. Origine : erreur de construction introduite par l’agent pendant
cette tâche, arrêtée avant livraison à une cible utilisateur.

## Faits et cause vérifiée

La première image construite avec `podman build` démarre correctement Spring Boot,
mais `podman healthcheck run` renvoie « has no defined healthcheck » et le code
125. Le script de démarrage ne peut donc pas confirmer la disponibilité.
Le format OCI par défaut de cette construction ne conserve pas l’instruction
Docker `HEALTHCHECK` du `Containerfile`. Le journal et la reproduction sont
conservés localement dans `/tmp/pole-podman-package.log` et
`/tmp/pole-podman-smoke.log`.

La construction `--format docker` conserve au contraire le champ `Healthcheck`
dans les métadonnées de l’image de la livraison `0.1.0-podman.20261116.2`.
Le test complet du paquet est consigné dans le
[rapport de validation](../../docs/reference/quality/podman-delivery-2026-11-16.md).

## Correction et variantes

`scripts/package-podman.sh` impose `--format docker` et refuse l’export si
l’inspection de l’image ne contient pas de commande de santé. Le test
`scripts/smoke-podman-delivery.py` démarre une installation isolée et exécute
réellement son contrôle de santé.

Recherche des variantes par `rg` sur `podman build`, `HEALTHCHECK` et `--health`
dans le dépôt : un seul constructeur applicatif et une seule instruction de
santé sont concernés. Les fichiers du devcontainer ne déclarent pas de contrôle
de santé applicatif équivalent. Aucun autre constructeur applicatif à corriger.

## Barrière et prévention

Le build du JAR et les tests HTTP sur JVM ne vérifient pas les métadonnées de
l’image. La présence du `HEALTHCHECK` dans le fichier ne suffit pas.
L’inspection bloquante avant export et le test sur le paquet réellement chargé
forment les deux barrières automatiques. Conserver ce contrôle lors d’un
changement d’image ou de format d’export.
