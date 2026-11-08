#!/bin/sh
# Turns a tall full-page screenshot into the scroll videos the case pages play:
# <out>/full.webm (1280x800, case page), <out>/preview.webm (960x600, card hover) and <out>/poster.webp.
# VP9 two-pass-free CRF encode; static pages compress to well under 1 MB per video.
# Usage: sh scripts/screenshot-to-webm.sh page.png public/assets/project-videos/<slug>
set -eu
src="$1"; out="$2"; mkdir -p "$out"
tmp=$(mktemp -d)
enc() { # width height seconds name
  ffmpeg -v error -y -i "$src" -vf "scale=$1:-2:flags=lanczos" "$tmp/$4.png"
  ffmpeg -v error -y -loop 1 -framerate 30 -t "$3" -i "$tmp/$4.png" -an \
    -vf "crop=$1:$2:0:'(ih-$2)*(0.5*clip((t-0.8)/($3-1.6),0,1)+0.5*(pow(clip((t-0.8)/($3-1.6),0,1),2)*(3-2*clip((t-0.8)/($3-1.6),0,1))))'" \
    -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -pix_fmt yuv420p "$out/$5.webm"
}
h=$(ffprobe -v error -select_streams v -show_entries stream=height,width -of csv=p=0 "$src")
w=${h%,*}; ph=${h#*,}
full=$(( ph * 1280 / w )); secs=$(( full / 320 )); [ $secs -lt 8 ] && secs=8; [ $secs -gt 45 ] && secs=45
enc 1280 800 "$secs" f full
enc 960 600 14 p preview
node -e "require('sharp')(process.argv[1]).extract({left:0,top:0,width:1280,height:800}).webp({quality:80}).toFile(process.argv[2])" "$tmp/f.png" "$out/poster.webp"
rm -rf "$tmp"
ls -la "$out"
