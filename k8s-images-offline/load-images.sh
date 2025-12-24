#!/bin/bash
# Script to load all Docker images from tar.gz files

echo "Loading Docker images from ./k8s-images-offline..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

loaded=0
failed=0

for file in *.tar.gz; do
  if [ -f "$file" ]; then
    echo "Loading $file..."
    if gunzip -c "$file" | docker load; then
      echo "✓ Successfully loaded $file"
      ((loaded++))
    else
      echo "✗ Failed to load $file"
      ((failed++))
    fi
  fi
done

echo ""
echo "=== Summary ==="
echo "Loaded: $loaded"
echo "Failed: $failed"
echo "Total: $((loaded + failed))"
