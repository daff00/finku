#!/usr/bin/env bash
set -euo pipefail
umask 077

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"
compose_project_dir="$repo_root"
if command -v cygpath >/dev/null 2>&1; then
    compose_project_dir="$(cygpath -w "$repo_root")"
fi
backup_dir="${1:-$repo_root/backups}"
keep="${FINKU_BACKUP_KEEP:-7}"

if [[ ! "$keep" =~ ^[1-9][0-9]*$ ]]; then
    printf 'FINKU_BACKUP_KEEP must be a positive integer\n' >&2
    exit 2
fi

mkdir -p -- "$backup_dir"
backup_dir="$(cd -- "$backup_dir" && pwd)"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
container_path="/tmp/finku-${timestamp}.db"
backup_path="$backup_dir/finku-${timestamp}.db"
temporary_path="${backup_path}.tmp"

if [[ -e "$backup_path" || -e "$temporary_path" ]]; then
    printf 'Backup already exists for timestamp %s\n' "$timestamp" >&2
    exit 1
fi

MSYS_NO_PATHCONV=1 docker compose --project-directory "$compose_project_dir" exec -T backend \
    python -m app.core.sqlite_backup \
    --source /data/finku.db \
    --destination "$container_path"
docker compose --project-directory "$compose_project_dir" cp \
    "backend:$container_path" "$temporary_path"
mv -- "$temporary_path" "$backup_path"
MSYS_NO_PATHCONV=1 docker compose \
    --project-directory "$compose_project_dir" exec -T backend rm -- "$container_path"

mapfile -t existing_backups < <(
    find "$backup_dir" -maxdepth 1 -type f -name 'finku-*.db' -printf '%f\n' | sort -r
)
for ((index = keep; index < ${#existing_backups[@]}; index++)); do
    rm -- "$backup_dir/${existing_backups[$index]}"
done

printf 'Backup created: %s\n' "$backup_path"
