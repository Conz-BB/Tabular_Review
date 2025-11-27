#!/bin/bash
# Script to update git remote to your own repository
# Usage: ./setup-git-remote.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./setup-git-remote.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME"
    echo "Example: ./setup-git-remote.sh Conz-BB Tabular_Review"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2

echo "Setting remote to: https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "Verifying remote:"
git remote -v

echo ""
echo "✅ Remote updated! Now you can push with:"
echo "   git push -u origin main"

