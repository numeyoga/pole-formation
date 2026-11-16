#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
version=${1:?Usage : bash scripts/package-podman.sh VERSION [répertoire-sortie]}
[[ $version =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,100}$ ]] || { echo 'Version invalide' >&2; exit 1; }
output=${2:-dist/pole-formation-$version}
[[ ! -e $output ]] || { echo 'Le répertoire de sortie existe déjà.' >&2; exit 1; }
app_image=localhost/pole-formation:$version
db_image=docker.io/library/postgres:18-alpine
mise exec -- npm --prefix frontend ci
mise run build
# Docker image format preserves HEALTHCHECK; Podman's default OCI format drops it.
podman build --format docker -f Containerfile --build-arg APP_JAR=backend/target/pole-formation-0.1.0-SNAPSHOT.jar -t "$app_image" .
podman image inspect "$app_image" | mise exec -- python3 -c 'import json,sys; assert json.load(sys.stdin)[0].get("Healthcheck", {}).get("Test"), "HEALTHCHECK absent de l’image : livraison interrompue"'
podman pull "$db_image"
mkdir -p -- "$output"
cp deploy/podman/deploy.sh deploy/podman/init-database.sh deploy/podman/pole-formation.service "$output/"
printf 'RELEASE_APP_IMAGE=%q\nRELEASE_DB_IMAGE=%q\n' "$app_image" "$db_image" > "$output/release.env"
podman save --format docker-archive -o "$output/application.tar" "$app_image"
podman save --format docker-archive -o "$output/postgres.tar" "$db_image"
cp docs/how-to/build-deploy-container.md "$output/INSTALLATION.md"
podman image inspect "$app_image" "$db_image" > "$output/images.json"
git rev-parse HEAD > "$output/source-commit.txt"
git status --porcelain > "$output/source-changes.txt"
(cd -- "$output"; sha256sum application.tar postgres.tar deploy.sh init-database.sh release.env images.json source-commit.txt source-changes.txt INSTALLATION.md pole-formation.service > SHA256SUMS)
tar -czf "$output.tar.gz" -C "$output" .
echo "Livraison prête : $output (même architecture CPU que la machine de construction)."
