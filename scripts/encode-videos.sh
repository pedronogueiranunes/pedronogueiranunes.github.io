#!/bin/sh
# Encodes project videos: an AV1 copy (name.av1.mp4, loaded first where supported by src/scripts/video-source.ts)
# and a recompressed H.264 fallback that replaces name.mp4 only when it saves at least 10%.
# The AV1 copy is kept only when it is at least 10% smaller than the H.264 file; low-bitrate
# sources and dithered noise (dither-lab) come out larger in AV1 at the same quality.
# Tested on bsa-legal/full.mp4 against the original: AV1 CRF 36 = VMAF 97.1 at 39% of the size;
# H.264 CRF 20 = VMAF 96.9 at 72%. Above 95 is visually indistinguishable.
# Usage: sh scripts/encode-videos.sh public/assets/project-videos/*/*.mp4
set -eu
size() { stat -f %z "$1" 2>/dev/null || stat -c %s "$1"; }
for src in "$@"; do
  case "$src" in *.av1.mp4|*.tmp.mp4) continue ;; esac
  av1="${src%.mp4}.av1.mp4"
  tmp="${src%.mp4}.h264.tmp.mp4"
  [ -f "$av1" ] || ffmpeg -v error -y -i "$src" -an -c:v libsvtav1 -preset 4 -crf 36 -svtav1-params tune=0:scm=1 \
    -pix_fmt yuv420p -movflags +faststart "$av1" 2>/dev/null
  ffmpeg -v error -y -i "$src" -an -c:v libx264 -preset veryslow -crf 20 -tune animation \
    -pix_fmt yuv420p -profile:v high -movflags +faststart "$tmp"
  [ $(($(size "$tmp") * 10)) -le $(($(size "$src") * 9)) ] && mv "$tmp" "$src" || rm "$tmp"
  [ $(($(size "$av1") * 10)) -le $(($(size "$src") * 9)) ] || rm "$av1"
  echo "$src: h264 $(size "$src")$([ -f "$av1" ] && echo ", av1 $(size "$av1")")"
done
# The player only asks for AV1 files listed here, so a missing copy never costs a failed request.
dir=$(cd "$(dirname "$0")/.." && pwd)
( cd "$dir/public" && find assets/project-videos -name '*.av1.mp4' | sort | sed 's|^|"/|; s|\.av1\.mp4$|.mp4"|' | paste -sd, - | sed 's/^/[/; s/$/]/' ) > "$dir/src/data/av1-videos.json"
echo "Listed $(grep -o '"/' "$dir/src/data/av1-videos.json" | wc -l | tr -d ' ') AV1 copies in src/data/av1-videos.json"
