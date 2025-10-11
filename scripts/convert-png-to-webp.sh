#!/bin/bash

# Script to convert PNG files to WebP format in the assets directory
# Usage: ./scripts/convert-png-to-webp.sh

ASSETS_DIR="src/assets"
QUALITY=90

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed."
    echo "Install it with: sudo apt-get install webp (Ubuntu/Debian) or brew install webp (macOS)"
    exit 1
fi

# Check if assets directory exists
if [ ! -d "$ASSETS_DIR" ]; then
    echo "Error: Assets directory '$ASSETS_DIR' not found"
    exit 1
fi

# Find and convert all PNG files
png_files=$(find "$ASSETS_DIR" -type f -name "*.png")

if [ -z "$png_files" ]; then
    echo "No PNG files found in $ASSETS_DIR"
    exit 0
fi

echo "Converting PNG files to WebP..."
echo "Quality: $QUALITY"
echo ""

converted=0
for png_file in $png_files; do
    # Get the filename without extension
    filename="${png_file%.png}"
    webp_file="${filename}.webp"

    echo "Converting: $png_file -> $webp_file"

    # Convert to WebP
    if cwebp -q $QUALITY "$png_file" -o "$webp_file"; then
        echo "  ✓ Success"
        converted=$((converted + 1))
    else
        echo "  ✗ Failed"
    fi
    echo ""
done

echo "Conversion complete: $converted file(s) converted"
echo ""
echo "To delete original PNG files, run:"
echo "  find $ASSETS_DIR -type f -name '*.png' -delete"
