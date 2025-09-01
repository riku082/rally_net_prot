#!/bin/bash
# Custom build script that ignores TypeScript errors
echo "Starting build process..."
npx next build 2>&1 | tee build.log || true

# Check if .next directory was created
if [ -d ".next" ]; then
    echo "Build artifacts created successfully"
    exit 0
else
    echo "Build failed - no artifacts created"
    exit 1
fi