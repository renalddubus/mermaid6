#!/usr/bin/env bash
set -euo pipefail

image=${1:?Image Docker requise}
platform=${2:?Plateforme Docker requise}
shift 2
port=${SMOKE_PORT:-8080}
container="mermaid6-release-check-$$"
cleanup() {
  result=$?
  if [ "$result" -ne 0 ]; then docker logs "$container" >&2 || true; fi
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --name "$container" --platform "$platform" \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true \
  -p "127.0.0.1:${port}:8080" "$image" >/dev/null
for ((attempt=0; attempt<60; attempt++)); do
  health=$(docker inspect --format '{{.State.Health.Status}}' "$container")
  if [ "$health" = healthy ]; then break; fi
  if [ "$health" = unhealthy ]; then exit 1; fi
  sleep 1
done
[ "$health" = healthy ]
[ "$(docker exec "$container" id -u)" != 0 ]
actual_arch=$(docker image inspect --format '{{.Architecture}}' "$(docker inspect --format '{{.Image}}' "$container")")
[ "$actual_arch" = "${platform#linux/}" ]
if [ -n "${EXPECTED_REVISION:-}" ]; then
  [ "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$container")" = "$EXPECTED_REVISION" ]
fi
if [ -n "${EXPECTED_VERSION:-}" ]; then
  [ "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' "$container")" = "$EXPECTED_VERSION" ]
fi
export PLAYWRIGHT_BASE_URL="http://127.0.0.1:${port}"
[ "$(curl --fail --silent --show-error "${PLAYWRIGHT_BASE_URL}/healthz")" = ok ]
if [ "$#" -gt 0 ]; then "$@"; fi
