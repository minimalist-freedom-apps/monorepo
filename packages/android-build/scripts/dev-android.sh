#!/usr/bin/env bash
set -euo pipefail

TARGET_APP_DIR="${APP_DIR:-$PWD}"

cd "$TARGET_APP_DIR"

get_first_connected_device() {
	adb devices | tail -n +2 | awk '$2 == "device" { print $1 }' | head -n 1
}

wait_for_connected_device() {
	local started_at
	started_at=$(date +%s)

	while true; do
		local device_id
		device_id="$(get_first_connected_device)"

		if [[ -n "$device_id" ]]; then
			echo "$device_id"
			return 0
		fi

		if (( $(date +%s) - started_at > 120 )); then
			echo ""
			return 1
		fi

		sleep 2
	done
}

wait_for_device_boot() {
	local device_id="$1"
	local started_at
	started_at=$(date +%s)

	adb -s "$device_id" wait-for-device >/dev/null 2>&1

	while true; do
		if adb -s "$device_id" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' | grep -q '^1$'; then
			return 0
		fi

		if (( $(date +%s) - started_at > 240 )); then
			echo "Timed out waiting for Android device to boot: $device_id"
			exit 1
		fi

		sleep 2
	done
}

get_dev_port() {
	local explicit_port="${DEV_ANDROID_PORT:-}"

	if [[ -n "$explicit_port" ]]; then
		echo "$explicit_port"
		return 0
	fi

	if [[ -f ./config.ts ]]; then
		local parsed_port
		parsed_port="$(grep -Eo 'devPort:[[:space:]]*[0-9]+' ./config.ts | head -n 1 | grep -Eo '[0-9]+' || true)"

		if [[ -n "$parsed_port" ]]; then
			echo "$parsed_port"
			return 0
		fi
	fi

	echo "5173"
}

wait_for_dev_server() {
	local port="$1"
	local started_at
	started_at=$(date +%s)

	while true; do
		if curl -fsS "http://127.0.0.1:${port}" >/dev/null 2>&1; then
			return 0
		fi

		if (( $(date +%s) - started_at > 60 )); then
			echo "Timed out waiting for Vite dev server on port ${port}."
			exit 1
		fi

		sleep 1
	done
}

cleanup() {
	if [[ -n "${dev_server_pid:-}" ]]; then
		kill "$dev_server_pid" >/dev/null 2>&1 || true
	fi
}

trap cleanup EXIT INT TERM

target_device="$(get_first_connected_device)"

if [[ -z "$target_device" ]]; then
	echo "No connected Android device found. Starting emulator..."
	bun run --filter @minimalist-apps/android-e2e e2e:emulator
	target_device="$(wait_for_connected_device)"
fi

if [[ -z "$target_device" ]]; then
	echo "No Android device available after emulator start attempt."
	exit 1
fi

echo "Using Android target: $target_device"
wait_for_device_boot "$target_device"

dev_port="$(get_dev_port)"
echo "Starting Vite dev server on port ${dev_port}..."
bun run dev > /tmp/dev-android-vite.log 2>&1 &
dev_server_pid=$!

wait_for_dev_server "$dev_port"

live_reload_host="127.0.0.1"
adb -s "$target_device" reverse "tcp:${dev_port}" "tcp:${dev_port}" >/dev/null 2>&1 || true

cap_server_url="http://${live_reload_host}:${dev_port}"

echo "Using CAP_SERVER_URL=${cap_server_url}"
CAP_SERVER_URL="$cap_server_url" ./node_modules/.bin/cap run android --target "$target_device" -l --host "$live_reload_host" --port "$dev_port"

echo "Live reload running. Press Ctrl+C to stop."
wait "$dev_server_pid"
