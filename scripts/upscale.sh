#!/bin/bash
# AI-upscales images with the upscaler bundled in Upscayl.app (no need to open the app).
# Each result is saved next to its original as <name>@<scale>x.webp. The gallery shows every file as an image,
# so delete the original if the upscaled version should replace it.
#
# Usage: scripts/upscale.sh [-s scale] [-m model] [-c compression] image...
#   image           a path, a path inside the gallery's static folder (abstract/x.jpg),
#                   or just a filename (x.jpg), which is looked up in every gallery folder
#   -s scale        2, 3 or 4 (default 2)
#   -m model        high-fidelity (default, keeps fine detail), digital-art (smoother), remacri, upscayl-standard,
#                   ultrasharp, ultramix-balanced, upscayl-lite
#   -c compression  WebP lossy level from 0 (lossless, ~2.7 MB at 3x) to 100 (default 5; 20 is ~350 KB but blurs fine detail)
#
# Examples:
#   scripts/upscale.sh abstract/432_i1_f1b7fdd6_s0.84_52d560_2c84ac.jpg
#   scripts/upscale.sh -s 2 432_i1_f1b7fdd6_s0.84_52d560_2c84ac.jpg
#   scripts/upscale.sh -m digital-art _public_html_/gallery/static/drawings/*.jpg
#
# Images that already have an upscaled copy at that scale are skipped, as are the upscaled copies themselves
# and images already larger than MAX_SIZE (512 px) on both sides.
set -euo pipefail
shopt -s nullglob

UPSCAYL=/Applications/Upscayl.app/Contents/Resources
STATIC="$(cd "$(dirname "$0")/.." && pwd)/_public_html_/gallery/static"
scale=2
model=high-fidelity
compression=5
MAX_SIZE=512

usage() {
    awk 'NR == 1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "$0"
    exit "${1:-0}"
}

# Prints the image file an argument refers to, or explains on stderr why there isn't exactly one.
resolve() {
    if [[ -f $1 ]]; then
        echo "$1"
    elif [[ -f "$STATIC/$1" ]]; then
        echo "$STATIC/$1"
    elif [[ $1 != */* ]]; then
        local matches=("$STATIC"/*/"$1")
        if [[ ${#matches[@]} -eq 1 ]]; then
            echo "${matches[0]}"
        elif [[ ${#matches[@]} -eq 0 ]]; then
            echo "not found $1 (looked in every folder under $STATIC)" >&2
            return 1
        else
            echo "ambiguous $1 is in more than one folder; add the folder, e.g. $(basename "$(dirname "${matches[0]}")")/$1:" >&2
            printf '          %s\n' "${matches[@]}" >&2
            return 1
        fi
    else
        echo "not found $1" >&2
        return 1
    fi
}

while getopts "s:m:c:h" opt; do
    case $opt in
        s) scale=$OPTARG ;;
        m) model=${OPTARG%-4x} ;;
        c) compression=$OPTARG ;;
        h) usage ;;
        *) usage 1 ;;
    esac
done
shift $((OPTIND - 1))
[[ $# -gt 0 ]] || usage 1

[[ -x "$UPSCAYL/bin/upscayl-bin" ]] || { echo "Upscayl.app not found in /Applications" >&2; exit 1; }
[[ $scale =~ ^[234]$ ]] || { echo "scale must be 2, 3 or 4" >&2; exit 1; }
[[ $compression =~ ^[0-9]+$ && $compression -le 100 ]] || { echo "compression must be 0-100" >&2; exit 1; }
if [[ ! -f "$UPSCAYL/models/$model-4x.param" ]]; then
    echo "unknown model: $model" >&2
    echo "available: $(ls "$UPSCAYL/models" | sed -n 's/-4x\.param$//p' | tr '\n' ' ')" >&2
    exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

status=0
for arg in "$@"; do
    image=$(resolve "$arg") || { status=1; continue; }
    name=${image%.*}
    [[ $name =~ @[0-9]+x$ ]] && continue
    case $(echo "${image##*.}" | tr '[:upper:]' '[:lower:]') in
        jpg|jpeg|png|webp) ;;
        *) echo "skipping $image (only jpg, png and webp can be upscaled)" >&2; continue ;;
    esac
    read -r width height <<< "$(sips -g pixelWidth -g pixelHeight "$image" | awk '/pixel/ { printf "%s ", $2 }')"
    if (( width > MAX_SIZE && height > MAX_SIZE )); then
        echo "skipping $image (already ${width}x${height})"
        continue
    fi
    out="$name@${scale}x.webp"
    if [[ -e $out ]]; then
        echo "exists   $out"
        continue
    fi

    # Write outside the gallery first so a half-finished file never shows up there.
    if ! "$UPSCAYL/bin/upscayl-bin" -i "$image" -o "$tmp/out.webp" -m "$UPSCAYL/models" -n "$model-4x" \
            -s "$scale" -f webp -c "$compression" > "$tmp/log" 2>&1 || [[ ! -s "$tmp/out.webp" ]]; then
        echo "failed   $image" >&2
        cat "$tmp/log" >&2
        exit 1
    fi
    mv "$tmp/out.webp" "$out"
    echo "created  $out ($(( $(stat -f %z "$out") / 1024 )) KB)"
done
exit $status
