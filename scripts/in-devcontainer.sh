#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
if [ -f /run/.containerenv ] || [ -f /.dockerenv ]; then
    cd "$project_root"
    exec "$@"
fi
for engine in podman docker; do
    command -v "$engine" >/dev/null 2>&1 || continue
    container_id=$("$engine" ps --filter "label=devcontainer.local_folder=$project_root" --filter "label=com.docker.compose.service=workspace" --format '{{.ID}}' 2>/dev/null) || continue
    [ -n "$container_id" ] || continue
    case "$container_id" in
        *[[:space:]]*) echo "Plusieurs workspaces actifs : exécuter Git dans le devcontainer voulu." >&2; exit 1 ;;
    esac
    exec "$engine" exec --user pwuser --workdir /workspaces/pole-formation "$container_id" "$@"
done
echo "Ouvrir le devcontainer avant cette opération : le suivi ne s’exécute pas sur l’hôte." >&2
exit 1
