#!/usr/bin/env bash
# 打包 Chrome 擴充功能（上架用：manifest 在 ZIP 根目錄；不含 Sample.png、原始圖稿等）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

DEFAULT_OUT="ELK-Field-Copy-store.zip"
OUT="${1:-$DEFAULT_OUT}"
case "$OUT" in
  /*) ZIP_PATH="$OUT" ;;
  *) ZIP_PATH="$ROOT/$OUT" ;;
esac

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp manifest.json background.js styles.css "$TMP/"
cp -R background content offscreen icons "$TMP/"

rm -f "$ZIP_PATH"
( cd "$TMP" && zip -rq "$ZIP_PATH" . )

echo "已建立: $ZIP_PATH ($(du -h "$ZIP_PATH" | cut -f1))"
echo "內容:"
unzip -l "$ZIP_PATH"