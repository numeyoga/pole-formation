#!/usr/bin/env bash
set -euo pipefail
# Only executed by the official image on a new volume. No password in process arguments.
APP_DB_PASSWORD=$(cat /run/secrets/app-db-password)
export APP_DB_PASSWORD
psql -v ON_ERROR_STOP=1 --username postgres --dbname pole_formation <<'SQL'
\getenv app_password APP_DB_PASSWORD
CREATE ROLE pole_formation LOGIN PASSWORD :'app_password';
ALTER DATABASE pole_formation OWNER TO pole_formation;
REVOKE ALL ON DATABASE pole_formation FROM PUBLIC;
SQL
unset APP_DB_PASSWORD
