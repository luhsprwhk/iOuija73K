#!/bin/bash

# Script to convert MP3 files to OGG format in the audio directory
# Usage: ./scripts/convert-mp3-to-ogg.sh

AUDIO_DIR="public/audio"
QUALITY=5  # OGG quality scale: -1 (lowest) to 10 (highest), 5 is good balance

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed."
    echo "Install it with: sudo apt-get install ffmpeg (Ubuntu/Debian) or brew install ffmpeg (macOS)"
    exit 1
fi

# Check if audio directory exists
if [ ! -d "$AUDIO_DIR" ]; then
    echo "Error: Audio directory '$AUDIO_DIR' not found"
    exit 1
fi

# Find and convert all MP3 files
mp3_files=$(find "$AUDIO_DIR" -type f -name "*.mp3")

if [ -z "$mp3_files" ]; then
    echo "No MP3 files found in $AUDIO_DIR"
    exit 0
fi

echo "Converting MP3 files to OGG..."
echo "Quality: $QUALITY (scale: -1 to 10)"
echo ""

converted=0
for mp3_file in $mp3_files; do
    # Get the filename without extension
    filename="${mp3_file%.mp3}"
    ogg_file="${filename}.ogg"

    echo "Converting: $mp3_file -> $ogg_file"

    # Convert to OGG using ffmpeg
    if ffmpeg -i "$mp3_file" -c:a libvorbis -q:a $QUALITY "$ogg_file" -y -loglevel error; then
        echo "  ✓ Success"
        converted=$((converted + 1))
    else
        echo "  ✗ Failed"
    fi
    echo ""
done

echo "Conversion complete: $converted file(s) converted"
echo ""
echo "To delete original MP3 files, run:"
echo "  find $AUDIO_DIR -type f -name '*.mp3' -delete"
